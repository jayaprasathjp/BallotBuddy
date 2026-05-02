/**
 * Firebase Cloud Messaging Service
 * Sends election reminder push notifications.
 */
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
const logger = require('./logger');

const SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];
const auth = new GoogleAuth({
  scopes: SCOPES,
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID,
});

/**
 * Get OAuth2 access token for FCM v1
 */
const getAccessToken = async () => {
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
};

/**
 * Send a push notification to a specific device token
 * @param {string} token - FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload
 */
const sendNotification = async (token, title, body, data = {}) => {
  if (!token) {
    logger.warn('FCM: No token provided, skipping notification');
    return { success: false, reason: 'no_token' };
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'ballotbuddy-demo';
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  const message = {
    message: {
      token,
      notification: { title, body },
      data: { ...data, clickAction: 'FLUTTER_NOTIFICATION_CLICK' },
      android: {
        notification: {
          icon: 'ballot_icon',
          color: '#1976d2',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: { badge: 1, sound: 'default' },
        },
      },
    }
  };

  try {
    const accessToken = await getAccessToken();
    const response = await axios.post(url, message, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    logger.info('FCM notification sent', { messageId: response.data.name });
    return { success: true, messageId: response.data.name };
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    logger.error('FCM notification failed', { error: errorMessage, token: token.slice(0, 8) });
    return { success: false, reason: errorMessage };
  }
};

/**
 * Send election reminder notifications to multiple users
 * @param {Array<string>} tokens - Array of FCM tokens
 * @param {Object} event - Election event object
 */
const sendElectionReminder = async (tokens, event) => {
  if (!tokens || tokens.length === 0) return;

  const title = `🗳️ Election Reminder: ${event.title}`;
  const body = `${event.description} - ${new Date(event.date).toLocaleDateString('en-IN')}`;

  const results = await Promise.allSettled(
    tokens.map((token) => sendNotification(token, title, body, {
      eventId: event.id,
      type: 'election_reminder',
    }))
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  logger.info(`Election reminder sent to ${succeeded}/${tokens.length} devices`);
  return { sent: succeeded, total: tokens.length };
};

module.exports = { sendNotification, sendElectionReminder };
