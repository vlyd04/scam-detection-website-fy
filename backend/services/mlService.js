const axios = require("axios");

function getMLPredictUrl() {
    const raw =
        process.env.ML_SERVICE_URL || "http://127.0.0.1:8001/predict";
    const base = String(raw).trim().replace(/\/+$/, "");
    return base.endsWith("/predict") ? base : `${base}/predict`;
}

async function getMLPrediction(features) {
    const mlUrl = getMLPredictUrl();

    try {
        const response = await axios.post(mlUrl, features, {
            timeout: 30000
        });
        return response.data;
    } catch (err) {
        const status = err.response?.status;
        const details = err.response?.data?.detail || err.response?.data?.error;

        console.error("ML service error:", {
            message: err.message,
            status,
            url: mlUrl,
            details
        });

        if (status) {
            throw new Error(`ML service error (${status})`);
        }

        if (err.code === "ECONNABORTED") {
            throw new Error("ML service timed out. Please try again in a few seconds.");
        }

        throw new Error("ML service unavailable");
    }
}

module.exports = { getMLPrediction };