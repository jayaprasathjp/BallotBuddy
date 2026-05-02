require('dotenv').config();
const { Storage } = require('@google-cloud/storage');

async function testStorage() {
  try {
    const storage = new Storage({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: process.env.GOOGLE_CLOUD_PROJECT
    });
    
    console.log('Checking Cloud Storage for project:', process.env.GOOGLE_CLOUD_PROJECT);
    const [buckets] = await storage.getBuckets();
    console.log('Success! Found buckets:', buckets.map(b => b.name));
  } catch (error) {
    console.error('Storage Error:', error.message);
  }
}

testStorage();
