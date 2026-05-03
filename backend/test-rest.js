require('dotenv').config();
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function testRest() {
  const auth = new GoogleAuth({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: 'https://www.googleapis.com/auth/cloud-platform'
  });
  const client = await auth.getClient();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = 'us-central1';
  const model = 'gemini-1.0-pro';
  const accessToken = await client.getAccessToken();

  const url = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:streamGenerateContent`;

  const payload = {
    contents: [{
      role: 'user',
      parts: [{ text: 'Hello' }]
    }]
  };

  try {
    const logger = require('./src/services/logger');
    logger.info('Calling REST API', { model, location });
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json'
      }
    });
    logger.info('REST API call successful');
  } catch (error) {
    const logger = require('./src/services/logger');
    logger.error('REST API test failed', { 
      error: error.response?.data?.error?.message || error.message,
      details: error.response?.data 
    });
  }
}

testRest();
