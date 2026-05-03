require("dotenv").config();
const { Firestore } = require("@google-cloud/firestore");

async function testFirestore() {
  try {
    const db = new Firestore({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });

    const logger = require("./src/services/logger");
    const collections = await db.listCollections();
    logger.info("Firestore connection successful", {
      collections: collections.map((c) => c.id),
    });
  } catch (error) {
    const logger = require("./src/services/logger");
    logger.error("Firestore connection failed", { error: error.message });
  }
}

testFirestore();
