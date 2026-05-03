const axios = require("axios");

async function testApi() {
  try {
    const response = await axios.post(
      "http://localhost:3001/api/chat",
      {
        message: "What is the voting age in India?",
        history: [],
      },
      {
        headers: { "x-guest-id": "test-user-123" },
      },
    );
    const logger = require("./src/services/logger");
    logger.info("API test successful", {
      status: response.status,
      data: response.data,
    });
  } catch (error) {
    const logger = require("./src/services/logger");
    logger.error("API test failed", {
      error: error.response?.data || error.message,
    });
  }
}

testApi();
