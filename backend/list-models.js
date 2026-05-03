require('dotenv').config();
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function listModels() {
  const auth = new GoogleAuth({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: 'https://www.googleapis.com/auth/cloud-platform'
  });
  const client = await auth.getClient();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = 'us-central1';
  const accessToken = await client.getAccessToken();

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models`;

  try {
    const logger = require('./src/services/logger');
    logger.info('Listing Vertex AI models', { location });
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken.token}`
      }
    });
    logger.info('Available Models fetched', { models: response.data.models.map(m => m.name.split('/').pop()) });
  } catch (error) {
    const logger = require('./src/services/logger');
    logger.error('Error listing models', { error: error.response?.data?.error?.message || error.message });
  }
}

listModels();
