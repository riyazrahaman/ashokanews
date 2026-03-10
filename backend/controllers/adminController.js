const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const News = require('../models/News');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ error: 'Your account has been deactivated' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/me
// @access  Private
const getMe = async (req, res) => {
  res.json({ success: true, admin: req.admin });
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const [totalNews, publishedNews, totalViews, recentNews, categoryStats] = await Promise.all([
      News.countDocuments(),
      News.countDocuments({ published: true }),
      News.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      News.find({ published: true }).sort({ createdAt: -1 }).limit(5).select('title category views createdAt'),
      News.aggregate([
        { $match: { published: true } },
        { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$views' } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalNews,
        publishedNews,
        draftNews: totalNews - publishedNews,
        totalViews: totalViews[0]?.total || 0,
      },
      recentNews,
      categoryStats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error fetching dashboard data' });
  }
};

// @desc    Change password
// @route   PUT /api/admin/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin._id).select('+password');

    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { login, getMe, getDashboard, changePassword };
