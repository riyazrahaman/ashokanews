require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const scheduledPublisher = require('./config/scheduler');

const app = express();
app.set('trust proxy', 1);

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/news', require('./routes/news'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'Ashoka News API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start scheduled jobs
scheduledPublisher.start();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Ashoka News API running on port ${PORT}`);
  console.log(`📰 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
