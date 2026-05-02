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
    console.log(`Calling REST API for ${model} in ${location}...`);
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Success! Response received.');
    console.log('AI:', response.data[0].candidates[0].content.parts[0].text);
  } catch (error) {
    console.error('REST Error:', error.response?.data?.error?.message || error.message);
    if (error.response?.data) {
      console.log('Full Error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testRest();
