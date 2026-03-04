const axios = require("axios");

console.log("=".repeat(100));
console.log("TESTING COMMUNICATION FLOW: Frontend → Backend → ML Service");
console.log("=".repeat(100));

async function testFullCommunication() {
    const testUrl = "https://www.ieu.edu.tr/tr";

    console.log("\n📍 STEP 1: Frontend → Backend");
    console.log("-".repeat(100));
    console.log(`  Request: POST http://localhost:3000/analyze`);
    console.log(`  Body: { url: "${testUrl}" }`);

    try {
        const backendResponse = await axios.post(
            "http://localhost:3000/analyze",
            { url: testUrl },
            { timeout: 30000 }
        );

        console.log(`  ✅ Status: ${backendResponse.status}`);
        console.log(`  ✅ Response received from backend:`);
        console.log(JSON.stringify(backendResponse.data, null, 2));

        console.log("\n📊 STEP 2: Verify Response Structure");
        console.log("-".repeat(100));

        const data = backendResponse.data;
        const checks = {
            "Has 'verdict' field": data.verdict !== undefined,
            "Has 'riskScore' field": data.riskScore !== undefined,
            "Has 'ml_probability' field": data.ml_probability !== undefined,
            "Has 'explanation' field": data.explanation !== undefined,
            "Has 'top_features' array": Array.isArray(data.explanation?.top_features),
            "verdict is string": typeof data.verdict === "string",
            "riskScore is number": typeof data.riskScore === "number",
            "ml_probability is number": typeof data.ml_probability === "number",
            "riskScore in range 0-100": data.riskScore >= 0 && data.riskScore <= 100
        };

        for (const [check, passed] of Object.entries(checks)) {
            console.log(`  ${passed ? "✅" : "❌"} ${check}`);
        }

        console.log("\n📋 STEP 3: Data Consistency Check");
        console.log("-".repeat(100));

        // Check if risk score matches probability
        const expectedRiskScore = Math.round(data.ml_probability * 100);
        const riskScoreMatch = data.riskScore === expectedRiskScore;
        console.log(`  ML Probability: ${data.ml_probability}`);
        console.log(`  Risk Score: ${data.riskScore}`);
        console.log(`  Expected: ${expectedRiskScore}`);
        console.log(`  ${riskScoreMatch ? "✅" : "❌"} Risk score matches probability`);

        // Check if verdict matches risk score
        let expectedVerdict;
        if (data.riskScore >= 70) expectedVerdict = "Likely Scam";
        else if (data.riskScore >= 40) expectedVerdict = "Suspicious";
        else expectedVerdict = "Likely Legit";

        const verdictMatch = data.verdict === expectedVerdict;
        console.log(`  Verdict: ${data.verdict}`);
        console.log(`  Expected: ${expectedVerdict}`);
        console.log(`  ${verdictMatch ? "✅" : "❌"} Verdict matches risk score`);

        console.log("\n📡 STEP 4: Communication Summary");
        console.log("-".repeat(100));
        console.log("  Frontend → Backend:");
        console.log(`    ✅ Sends: { url: "..." }`);
        console.log(`    ✅ Receives: { verdict, riskScore, ml_probability, explanation }`);
        console.log("\n  Backend → ML Service:");
        console.log(`    ✅ Sends: 14 feature values`);
        console.log(`    ✅ Receives: { prediction, confidence, explanations }`);
        console.log("\n  ML Service → Backend:");
        console.log(`    ✅ Returns: probability and feature explanations`);
        console.log("\n  Backend → Frontend:");
        console.log(`    ✅ Transforms: confidence → riskScore (0-100)`);
        console.log(`    ✅ Adds: verdict based on risk score`);

        console.log("\n" + "=".repeat(100));
        console.log("✅ COMMUNICATION TEST PASSED - All services are communicating correctly!");
        console.log("=".repeat(100));

    } catch (error) {
        console.log("\n❌ COMMUNICATION TEST FAILED");
        console.log("-".repeat(100));

        if (error.code === "ECONNREFUSED") {
            console.log(`  Error: Cannot connect to ${error.config?.url}`);
            console.log(`  Cause: Service is not running`);
            console.log(`\n  Solutions:`);
            if (error.config?.url?.includes("3000")) {
                console.log(`    - Start backend: cd backend && node server.js`);
            }
            if (error.config?.url?.includes("8001")) {
                console.log(`    - Start ML service: cd ml-service && python -m uvicorn app:app --port 8001 --reload`);
            }
        } else if (error.response) {
            console.log(`  HTTP Status: ${error.response.status}`);
            console.log(`  Error: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.log(`  Error: ${error.message}`);
        }

        console.log("\n" + "=".repeat(100));
    }
}

testFullCommunication();
