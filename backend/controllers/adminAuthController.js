const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { AdminModel } = require('../models/AdminModel');

// Admin Register
const adminRegister = async (req, res) => {
    try {
        const { name, email, password /*, secretKey */ } = req.body;

        // Secret-key gating for educator registration has been commented out to keep flow basic.
        // If you want to re-enable it later, restore the following logic and ensure
        // `process.env.ADMIN_SECRET_KEY` is set:
        // if (process.env.ADMIN_SECRET_KEY) {
        //     if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        //         return res.status(403).json({ error: 'Invalid admin secret key' });
        //     }
        // }

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingAdmin = await AdminModel.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const admin = await AdminModel.create({
            name,
            email,
            password // Will be hashed by pre-save hook
        });

        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            msg: 'Admin registration successful',
            token,
            admin: { 
                id: admin._id, 
                name: admin.name, 
                email: admin.email,
                role: admin.role 
            }
        });
    } catch (error) {
        console.error('Admin register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Admin Login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const admin = await AdminModel.findOne({ email });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!admin.isActive) {
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            msg: 'Login successful',
            token,
            admin: { 
                id: admin._id, 
                name: admin.name, 
                email: admin.email,
                role: admin.role 
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            admin: req.admin
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

// Admin Google OAuth (login only — does not auto-create admin accounts)
const adminGoogleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) return res.status(400).json({ error: 'Google token is required' });

        // Verify token with Google's tokeninfo endpoint
        const resp = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        const payload = resp.data;

        const email = payload.email;
        const email_verified = payload.email_verified || payload.email_verified === 'true';

        if (!email || !email_verified) {
            return res.status(400).json({ error: 'Invalid Google token' });
        }

        // Only allow login if an admin account already exists for this email
        const admin = await AdminModel.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(403).json({ error: 'No educator account found for this Google account' });
        }

        if (!admin.isActive) {
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        const jwtToken = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            msg: 'Login successful',
            token: jwtToken,
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (error) {
        console.error('Admin Google auth error:', error.response?.data || error.message || error);
        res.status(500).json({ error: 'Google authentication failed' });
    }
};

module.exports = { adminRegister, adminLogin, getAdminProfile, adminGoogleAuth };