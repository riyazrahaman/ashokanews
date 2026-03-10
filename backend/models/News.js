const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  imageUrl: {
    type: String,
    default: null
  },
  imagePublicId: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['Announcements', 'Events', 'Achievements', 'Placements', 'Circulars', 'Sports', 'Cultural', 'Academic'],
    required: [true, 'Category is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  author: {
    type: String,
    default: 'Ashoka Women\'s College'
  }
}, {
  timestamps: true
});

// Indexes for performance
newsSchema.index({ published: 1, createdAt: -1 });
newsSchema.index({ category: 1, published: 1 });
newsSchema.index({ title: 'text', shortDescription: 'text', content: 'text', tags: 'text' });

// Virtual for formatted date
newsSchema.virtual('formattedDate').get(function () {
  return this.publishedAt
    ? this.publishedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : this.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
});

newsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('News', newsSchema);
