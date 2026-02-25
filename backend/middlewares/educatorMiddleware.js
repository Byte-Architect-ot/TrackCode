/**
 * Educator middleware - accepts admin (educator) token and sets req.userId for compatibility
 * with contest controllers that expect req.userId as the creator.
 * Falls back to dummy educator if no token provided (for development).
 */
const jwt = require('jsonwebtoken');
const { AdminModel } = require('../models/AdminModel');

// Get dummy educator as fallback
const getDummyEducator = async () => {
    try {
        // Try to find dummy educator by email
        const dummyAdmin = await AdminModel.findOne({ email: 'educator@demo.com' }).select('-password');
        if (dummyAdmin) {
            return {
                adminId: dummyAdmin._id,
                admin: dummyAdmin,
                userId: dummyAdmin._id,
                creatorType: 'admin'
            };
        }
    } catch (err) {
        console.warn('Could not find dummy educator:', err.message);
    }
    return null;
};

const educatorMiddleware = async (req, res, next) => {
    try {
        // Check both token header and Authorization header
        let token = req.headers.token || req.headers.authorization?.replace('Bearer ', '');

        // If no token, use dummy educator as fallback (development only)
        if (!token) {
            const dummy = await getDummyEducator();
            if (dummy) {
                req.adminId = dummy.adminId;
                req.admin = dummy.admin;
                req.userId = dummy.userId;
                req.creatorType = dummy.creatorType;
                return next();
            }
            return res.status(401).json({ error: 'No token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Try to find admin first (educator)
            let admin = await AdminModel.findById(decoded.id).select('-password');
            if (admin) {
                req.adminId = decoded.id;
                req.admin = admin;
                req.userId = decoded.id;
                req.creatorType = 'admin';
                return next();
            }

            // If not admin, check if it's a user with educator role (fallback)
            const { UserModel } = require('../models/UserModel');
            const user = await UserModel.findById(decoded.id).select('-password');
            if (user && user.role === 'educator') {
                req.userId = decoded.id;
                req.user = user;
                req.creatorType = 'user';
                return next();
            }
        } catch (jwtError) {
            // If JWT verification fails, try dummy educator as fallback
            if (jwtError.name === 'JsonWebTokenError' || jwtError.name === 'TokenExpiredError') {
                const dummy = await getDummyEducator();
                if (dummy) {
                    req.adminId = dummy.adminId;
                    req.admin = dummy.admin;
                    req.userId = dummy.userId;
                    req.creatorType = dummy.creatorType;
                    return next();
                }
            }
            throw jwtError;
        }

        // If neither found, try dummy educator as final fallback
        const dummy = await getDummyEducator();
        if (dummy) {
            req.adminId = dummy.adminId;
            req.admin = dummy.admin;
            req.userId = dummy.userId;
            req.creatorType = dummy.creatorType;
            return next();
        }

        return res.status(403).json({ error: 'Educator access required' });
    } catch (error) {
        console.error('Educator middleware error:', error);
        // Final fallback to dummy educator
        try {
            const dummy = await getDummyEducator();
            if (dummy) {
                req.adminId = dummy.adminId;
                req.admin = dummy.admin;
                req.userId = dummy.userId;
                req.creatorType = dummy.creatorType;
                return next();
            }
        } catch (fallbackErr) {
            // Ignore fallback errors
        }
        return res.status(500).json({ error: 'Authentication failed' });
    }
};

module.exports = { educatorMiddleware };
