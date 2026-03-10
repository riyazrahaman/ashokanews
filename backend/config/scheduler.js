const cron = require('node-cron');
const News = require('../models/News');
const { sendNewsNotification } = require('../services/fcm');

const scheduledPublisher = {
  start() {
    // Check every minute for news to publish
    cron.schedule('* * * * *', async () => {
      try {
        const now = new Date();
        const newsToPublish = await News.find({
          published: false,
          scheduledAt: { $lte: now },
          scheduledAt: { $ne: null }
        });

        for (const article of newsToPublish) {
          article.published = true;
          article.publishedAt = now;
          await article.save();

          // Send push notification
          await sendNewsNotification({
            title: `📰 ${article.title}`,
            body: article.shortDescription,
            newsId: article._id.toString(),
            imageUrl: article.imageUrl
          });

          console.log(`✅ Published scheduled article: ${article.title}`);
        }
      } catch (err) {
        console.error('Scheduler error:', err.message);
      }
    });

    console.log('⏰ Scheduled publisher started');
  }
};

module.exports = scheduledPublisher;
