const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation
];

const validateNews = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title too long'),
  body('shortDescription').trim().notEmpty().withMessage('Short description is required').isLength({ max: 500 }).withMessage('Short description too long'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').isIn(['Announcements', 'Events', 'Achievements', 'Placements', 'Circulars', 'Sports', 'Cultural', 'Academic']).withMessage('Invalid category'),
  handleValidation
];

module.exports = { validateLogin, validateNews };
