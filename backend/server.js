const express = require("express");
const cors = require("cors");
const extractFeatures = require("./utils/extractFeatures");
const { getMLPrediction } = require("./controllers/analyzeController");
const applyScamHeuristics = require("./utils/scamHeuristics");
const axios = require("axios");



const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Scam Website Detector API is running");
});


// app.post("/analyze-url", async (req, res) => {
//     const { url } = req.body;

//     const urlAnalysis = analyzeUrl(url);

//     if (urlAnalysis.error) {
//         return res.json({ error: urlAnalysis.error });
//     }

//     const hostname = new URL(url).hostname;
//     const domainAge = await getDomainAge(hostname);
//     const contentAnalysis = await analyzeContent(url);
//     const scamResult = calculateScamScore({
//         urlAnalysis,
//         domainAge,
//         contentAnalysis
//     });

//     res.json({
//         url,
//         urlAnalysis,
//         domainAge,
//         contentAnalysis,
//         scamResult
//     });
// });


app.post("/analyze", async (req, res) => {
    try {
        console.log("Incoming URL:", req.body.url);

        const features = await extractFeatures(req.body.url);

        console.log("Extracted features:", features);

        console.log("Sending to ML:", features);

        const mlResult = await getMLPrediction(features);

        console.log("Received ML result:", mlResult);

        // Apply hybrid approach: ML + Rule-based heuristics
        const hybridResult = applyScamHeuristics(
            features,
            mlResult.prediction,
            mlResult.confidence
        );

        console.log("Hybrid result:", hybridResult);

        const confidence = hybridResult.finalConfidence;
        const riskScore = Math.round(confidence * 100);

        console.log("Sending response to frontend");

        res.json({
            verdict:
                riskScore >= 70
                    ? "Likely Scam"
                    : riskScore >= 40
                        ? "Suspicious"
                        : "Likely Legit",

            riskScore,
            ml_probability: confidence,

            // Include hybrid analysis details
            analysis: {
                method: hybridResult.method,
                ml_confidence: hybridResult.originalConfidence,
                heuristic_adjustment: hybridResult.heuristicBoost,
                applied_rules: hybridResult.appliedRules
            },

            explanation: {
                top_features: mlResult.explanations
            }
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});




app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

