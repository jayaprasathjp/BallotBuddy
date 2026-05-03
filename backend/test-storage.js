require('dotenv').config();
const { Storage } = require('@google-cloud/storage');

async function testStorage() {
  try {
    const storage = new Storage({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: process.env.GOOGLE_CLOUD_PROJECT
    });
    
    const logger = require('./src/services/logger');
    logger.info('Checking Cloud Storage', { project: process.env.GOOGLE_CLOUD_PROJECT });
    const [buckets] = await storage.getBuckets();
    logger.info('Cloud Storage connection successful', { buckets: buckets.map(b => b.name) });
  } catch (error) {
    const logger = require('./src/services/logger');
    logger.error('Cloud Storage connection failed', { error: error.message });
  }
}

testStorage();
