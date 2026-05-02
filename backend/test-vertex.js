require('dotenv').config();
const { VertexAI } = require('@google-cloud/vertexai');
const logger = require('./src/services/logger');

const test = async () => {
  const PROJECT_ID = '442722843230';
  const LOCATION = 'us-central1';
  
  console.log('Project:', PROJECT_ID);
  console.log('Location:', LOCATION);
  
  try {
    const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
    
    console.log('Calling Vertex AI...');
    const result = await generativeModel.generateContent('Hello');
    console.log('Response:', result.response.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) console.error(error.stack);
  }
};

test();
