const express = require('express');
const router = express.Router();
const {
  getNews, getFeaturedNews, getNewsById, searchNews,
  getAllNewsAdmin, createNews, updateNews, deleteNews, togglePublish
} = require('../controllers/newsController');
const { protect } = require('../middleware/auth');
const { validateNews } = require('../middleware/validate');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getNews);
router.get('/featured', getFeaturedNews);
router.get('/search', searchNews);
router.get('/:id', getNewsById);

// Protected admin routes
router.get('/admin/all', protect, getAllNewsAdmin);
router.post('/', protect, upload.single('image'), createNews);
router.put('/:id', protect, upload.single('image'), updateNews);
router.delete('/:id', protect, deleteNews);
router.patch('/:id/publish', protect, togglePublish);

module.exports = router;
