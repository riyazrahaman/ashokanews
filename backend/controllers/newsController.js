const News = require('../models/News');
const { cloudinary } = require('../config/cloudinary');
const { sendNewsNotification } = require('../services/fcm');

// @desc    Get all published news (with pagination)
// @route   GET /api/news
// @access  Public
const getNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const skip = (page - 1) * limit;

    const filter = { published: true };
    if (category && category !== 'All') filter.category = category;

    const [news, total] = await Promise.all([
      News.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content -imagePublicId'),
      News.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Server error fetching news' });
  }
};

// @desc    Get featured/latest news for hero section
// @route   GET /api/news/featured
// @access  Public
const getFeaturedNews = async (req, res) => {
  try {
    const news = await News.find({ published: true, featured: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-content -imagePublicId');

    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get single news article
// @route   GET /api/news/:id
// @access  Public
const getNewsById = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!news || !news.published) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Get related news
    const related = await News.find({
      _id: { $ne: news._id },
      category: news.category,
      published: true
    }).limit(4).select('-content -imagePublicId');

    res.json({ success: true, data: news, related });
  } catch (error) {
    console.error('Get news by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Search news
// @route   GET /api/news/search
// @access  Public
const searchNews = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.status(400).json({ error: 'Search query is required' });

    const news = await News.find({
      $text: { $search: q },
      published: true
    }, {
      score: { $meta: 'textScore' }
    })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .select('-content -imagePublicId');

    res.json({ success: true, data: news, query: q });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Server error during search' });
  }
};

// @desc    Get all news (admin - includes drafts)
// @route   GET /api/news/admin/all
// @access  Private
const getAllNewsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.published !== undefined) filter.published = req.query.published === 'true';

    const [news, total] = await Promise.all([
      News.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-content'),
      News.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: news,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create news article
// @route   POST /api/news
// @access  Private
const createNews = async (req, res) => {
  try {
    const { title, shortDescription, content, category, tags, publishNow, scheduledAt, featured, author } = req.body;

    const newsData = {
      title,
      shortDescription,
      content,
      category,
      tags: tags ? JSON.parse(tags) : [],
      featured: featured === 'true',
      author: author || 'Ashoka Women\'s College'
    };

    if (req.file) {
      newsData.imageUrl = req.file.path;
      newsData.imagePublicId = req.file.filename;
    }

    if (publishNow === 'true') {
      newsData.published = true;
      newsData.publishedAt = new Date();
    } else if (scheduledAt) {
      newsData.scheduledAt = new Date(scheduledAt);
      newsData.published = false;
    }

    const news = await News.create(newsData);

    // Send push notification if published immediately
    if (newsData.published) {
      await sendNewsNotification({
        title: `📰 ${news.title}`,
        body: news.shortDescription,
        newsId: news._id.toString(),
        imageUrl: news.imageUrl
      });
    }

    res.status(201).json({ success: true, data: news, message: 'Article created successfully' });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Server error creating article' });
  }
};

// @desc    Update news article
// @route   PUT /api/news/:id
// @access  Private
const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'Article not found' });

    const { title, shortDescription, content, category, tags, publishNow, scheduledAt, featured, author } = req.body;

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary
      if (news.imagePublicId) {
        await cloudinary.uploader.destroy(news.imagePublicId);
      }
      news.imageUrl = req.file.path;
      news.imagePublicId = req.file.filename;
    }

    news.title = title || news.title;
    news.shortDescription = shortDescription || news.shortDescription;
    news.content = content || news.content;
    news.category = category || news.category;
    news.tags = tags ? JSON.parse(tags) : news.tags;
    news.featured = featured !== undefined ? featured === 'true' : news.featured;
    news.author = author || news.author;

    if (publishNow === 'true' && !news.published) {
      news.published = true;
      news.publishedAt = new Date();
    } else if (scheduledAt) {
      news.scheduledAt = new Date(scheduledAt);
    }

    await news.save();
    res.json({ success: true, data: news, message: 'Article updated successfully' });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Server error updating article' });
  }
};

// @desc    Delete news article
// @route   DELETE /api/news/:id
// @access  Private
const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'Article not found' });

    // Delete image from Cloudinary
    if (news.imagePublicId) {
      await cloudinary.uploader.destroy(news.imagePublicId);
    }

    await news.deleteOne();
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Server error deleting article' });
  }
};

// @desc    Toggle publish status
// @route   PATCH /api/news/:id/publish
// @access  Private
const togglePublish = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'Article not found' });

    news.published = !news.published;
    if (news.published) news.publishedAt = new Date();
    await news.save();

    if (news.published) {
      await sendNewsNotification({
        title: `📰 ${news.title}`,
        body: news.shortDescription,
        newsId: news._id.toString(),
        imageUrl: news.imageUrl
      });
    }

    res.json({ success: true, data: news, message: `Article ${news.published ? 'published' : 'unpublished'}` });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getNews, getFeaturedNews, getNewsById, searchNews, getAllNewsAdmin, createNews, updateNews, deleteNews, togglePublish };
