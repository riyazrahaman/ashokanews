const express = require('express');
const router = express.Router();
const { login, getMe, getDashboard, changePassword } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { validateLogin } = require('../middleware/validate');

router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.get('/dashboard', protect, getDashboard);
router.put('/change-password', protect, changePassword);

module.exports = router;
