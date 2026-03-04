const axios = require("axios");

const ML_SERVICE_URL = "http://localhost:8001/predict";

async function getMLPrediction(features) {
    try {
        const response = await axios.post(ML_SERVICE_URL, features, {
            timeout: 5000
        });
        return response.data;
    } catch (err) {
        console.error("ML service error:", err.message);
        throw new Error("ML service unavailable");
    }
}

module.exports = { getMLPrediction };