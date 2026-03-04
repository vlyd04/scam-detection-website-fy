const axios = require("axios");

async function getMLPrediction(features) {
    try {
        const response = await axios.post(
            process.env.ML_SERVICE_URL || "http://127.0.0.1:8001/predict",
            features,
            {
            timeout: 5000
        });
        return response.data;
    } catch (err) {
        console.error("ML service error:", err.message);
        throw new Error("ML service unavailable");
    }
}

module.exports = { getMLPrediction };