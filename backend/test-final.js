require('dotenv').config();
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function test() {
  const auth = new GoogleAuth({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: 'https://www.googleapis.com/auth/cloud-platform'
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent`;

  try {
    await axios.post(url, {
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    }, {
      headers: { Authorization: `Bearer ${token.token}` }
    });
    const logger = require('./src/services/logger');
    logger.info('Final test successful');
  } catch (error) {
    const logger = require('./src/services/logger');
    logger.error('Final test failed', { error: error.response?.data?.error?.message || error.message });
  }
}
test();
