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
    const response = await axios.post(url, {
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    }, {
      headers: { Authorization: `Bearer ${token.token}` }
    });
    console.log('SUCCESS:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('FAIL:', error.response?.data?.error?.message || error.message);
  }
}
test();
