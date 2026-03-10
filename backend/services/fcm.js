const FCMToken = require('../models/FCMToken');

let admin;
try {
  admin = require('firebase-admin');
  if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
  }
} catch (e) {
  console.warn('⚠️ Firebase Admin not configured. Push notifications disabled.');
}

const sendNewsNotification = async ({ title, body, newsId, imageUrl }) => {
  if (!admin?.apps?.length) return;

  try {
    const tokens = await FCMToken.find({}).select('token');
    if (!tokens.length) return;

    const tokenList = tokens.map(t => t.token);
    const chunks = [];
    for (let i = 0; i < tokenList.length; i += 500) {
      chunks.push(tokenList.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const message = {
        notification: { title, body },
        data: { newsId, type: 'news' },
        ...(imageUrl && { android: { notification: { imageUrl } } }),
        tokens: chunk
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      // Remove invalid tokens
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (errCode === 'messaging/invalid-registration-token' ||
              errCode === 'messaging/registration-token-not-registered') {
            failedTokens.push(chunk[idx]);
          }
        }
      });

      if (failedTokens.length) {
        await FCMToken.deleteMany({ token: { $in: failedTokens } });
      }
    }

    console.log(`📱 Push notification sent to ${tokenList.length} devices`);
  } catch (error) {
    console.error('FCM error:', error.message);
  }
};

const registerToken = async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token) return res.status(400).json({ error: 'FCM token is required' });

    await FCMToken.findOneAndUpdate(
      { token },
      { token, platform: platform || 'android' },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Token registered' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { sendNewsNotification, registerToken };
