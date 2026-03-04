const { getMLPrediction } = require("../services/mlService");
const { extractFeatures } = require("../utils/featureExtractor");

exports.scanURL = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL required" });
        }

        // Feature extraction (your existing logic)
        const features = extractFeatures(url);

        // ML prediction
        const mlResult = await getMLPrediction(features);

        return res.json({
            url,
            prediction: mlResult.prediction,
            confidence: mlResult.confidence,
            explanations: mlResult.explanations
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};