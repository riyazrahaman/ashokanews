const express = require('express');
const router = express.Router();
const { login, getMe, getDashboard, changePassword } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { validateLogin } = require('../middleware/validate');

router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.get('/dashboard', protect, getDashboard);
router.put('/change-password', protect, changePassword);
router.get('/seed', async (req, res) => {
  const Admin = require('../models/Admin');
  await Admin.deleteMany({});
  await Admin.create({ username: 'admin', password: 'Ashoka@2024', name: 'Super Admin', role: 'super_admin' });
  res.json({ message: 'Admin created! Remove this route now.' });
});
module.exports = router;
