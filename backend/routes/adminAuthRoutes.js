const express = require('express');
const router = express.Router();
const { adminRegister, adminLogin, getAdminProfile, adminGoogleAuth } = require('../controllers/adminAuthController');
const { adminMiddleware } = require('../middlewares/adminMiddleware');

router.post('/register', adminRegister);
router.post('/login', adminLogin);
router.post('/google', adminGoogleAuth);
router.get('/profile', adminMiddleware, getAdminProfile);

module.exports = router;