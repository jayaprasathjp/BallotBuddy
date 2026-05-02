const axios = require('axios');

async function testApi() {
  try {
    const response = await axios.post('http://localhost:3001/api/chat', {
      message: 'What is the voting age in India?',
      history: []
    }, {
      headers: { 'x-guest-id': 'test-user-123' }
    });
    
    console.log('API Status:', response.status);
    console.log('AI Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
  }
}

testApi();
