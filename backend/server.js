const express = require("express");
const cors = require("cors");
const { URL } = require("url");
const calculateScamScore = require("./utils/scamScore");
const extractFeatures = require("./utils/extractFeatures");
const { getMLPrediction } = require("./controllers/analyzeController");
const axios = require("axios");



const app = express();
const PORT = 3000;

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


        let riskScore = 0;

        if (mlResult.probability > 0.8) riskScore += 60;
        else if (mlResult.probability > 0.6) riskScore += 40;
        else if (mlResult.probability > 0.4) riskScore += 20;

        console.log("Sending response to frontend");


        res.json({
            verdict:
                riskScore >= 70
                    ? "Likely Scam"
                    : riskScore >= 40
                        ? "Suspicious"
                        : "Likely Legit",
            riskScore,
            ml_probability: mlResult.probability
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});




app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

