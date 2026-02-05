const axios = require("axios");

async function getMLPrediction(features) {
    const response = await axios.post(
        "http://127.0.0.1:5001/predict",
        features,
        { timeout: 5000 }
    );
    return response.data;
}

module.exports = { getMLPrediction };
