require('dotenv').config();
const { VertexAI } = require('@google-cloud/vertexai');
const logger = require('./src/services/logger');

const test = async () => {
  const PROJECT_ID = '442722843230';
  const LOCATION = 'us-central1';
  
  logger.info('Starting Vertex AI test', { project: PROJECT_ID, location: LOCATION });
  
  try {
    const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
    
    logger.info('Calling Vertex AI...');
    const result = await generativeModel.generateContent('Hello');
    logger.info('Vertex AI Response received', { text: result.response.candidates[0].content.parts[0].text });
  } catch (error) {
    logger.error('Vertex AI test failed', { error: error.message, stack: error.stack });
  }
};

test();
