require('dotenv').config();
const { Firestore } = require('@google-cloud/firestore');

async function testFirestore() {
  try {
    const db = new Firestore({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: process.env.GOOGLE_CLOUD_PROJECT
    });
    
    console.log('Checking Firestore for project:', process.env.GOOGLE_CLOUD_PROJECT);
    const collections = await db.listCollections();
    console.log('Success! Found collections:', collections.map(c => c.id));
  } catch (error) {
    console.error('Firestore Error:', error.message);
  }
}

testFirestore();
