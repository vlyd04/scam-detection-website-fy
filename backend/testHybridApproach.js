const extractFeatures = require("./utils/extractFeatures");
const axios = require("axios");
const applyScamHeuristics = require("./utils/scamHeuristics");

// Same test cases as before
const testCases = [
    // LEGITIMATE SITES
    { url: "https://www.google.com", expected: "Legit", category: "Legitimate" },
    { url: "https://www.microsoft.com", expected: "Legit", category: "Legitimate" },
    { url: "https://www.github.com", expected: "Legit", category: "Legitimate" },
    { url: "https://www.amazon.com", expected: "Legit", category: "Legitimate" },
    { url: "https://www.wikipedia.org", expected: "Legit", category: "Legitimate" },

    // SUSPICIOUS/SCAM PATTERNS
    { url: "https://paypal-verify-account.xyz", expected: "Scam", category: "Fake Brand + Suspicious TLD" },
    { url: "https://secure-amazon-login.tk", expected: "Scam", category: "Fake Brand + Suspicious TLD" },
    { url: "http://192.168.1.1/admin", expected: "Scam", category: "IP-based URL" },
    { url: "https://g00gle-login.top", expected: "Scam", category: "Typosquatting + Suspicious TLD" },
    { url: "https://microsoft-verify.club", expected: "Scam", category: "Fake Brand + Suspicious TLD" },
];

async function compareMLvsHybrid() {
    console.log("=".repeat(100));
    console.log("COMPARING: ML-ONLY vs ML+HEURISTICS");
    console.log("=".repeat(100));

    let mlCorrect = 0;
    let hybridCorrect = 0;
    const total = testCases.length;

    const improvements = [];
    const regressions = [];

    for (const testCase of testCases) {
        console.log(`\n🔍 ${testCase.url}`);
        console.log(`   Category: ${testCase.category} | Expected: ${testCase.expected}`);

        try {
            const features = await extractFeatures(testCase.url);
            const mlResult = await axios.post("http://127.0.0.1:8001/predict", features, { timeout: 10000 });
            const { confidence, prediction } = mlResult.data;

            // ML-only prediction
            const mlVerdict = prediction === 1 ? "Scam" : "Legit";
            const mlIsCorrect = mlVerdict === testCase.expected;

            // Hybrid prediction
            const hybridResult = applyScamHeuristics(features, prediction, confidence);
            const hybridVerdict = hybridResult.finalPrediction === 1 ? "Scam" : "Legit";
            const hybridIsCorrect = hybridVerdict === testCase.expected;

            console.log(`   ML-Only:   ${mlVerdict} (${(confidence * 100).toFixed(1)}%) ${mlIsCorrect ? "✅" : "❌"}`);
            console.log(`   Hybrid:    ${hybridVerdict} (${(hybridResult.finalConfidence * 100).toFixed(1)}%) ${hybridIsCorrect ? "✅" : "❌"}`);

            if (hybridResult.heuristicBoost !== 0) {
                console.log(`   Adjustment: ${hybridResult.heuristicBoost > 0 ? "+" : ""}${(hybridResult.heuristicBoost * 100).toFixed(1)}%`);
                console.log(`   Rules: ${hybridResult.appliedRules.join(", ")}`);
            }

            if (mlIsCorrect) mlCorrect++;
            if (hybridIsCorrect) hybridCorrect++;

            // Track improvements/regressions
            if (!mlIsCorrect && hybridIsCorrect) {
                improvements.push({ url: testCase.url, rules: hybridResult.appliedRules });
            } else if (mlIsCorrect && !hybridIsCorrect) {
                regressions.push({ url: testCase.url, rules: hybridResult.appliedRules });
            }

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }

    console.log("\n" + "=".repeat(100));
    console.log("ACCURACY COMPARISON");
    console.log("=".repeat(100));
    console.log(`ML-Only Accuracy:     ${mlCorrect}/${total} (${((mlCorrect / total) * 100).toFixed(1)}%)`);
    console.log(`Hybrid Accuracy:      ${hybridCorrect}/${total} (${((hybridCorrect / total) * 100).toFixed(1)}%)`);
    console.log(`Improvement:          ${hybridCorrect - mlCorrect > 0 ? "+" : ""}${hybridCorrect - mlCorrect} predictions`);

    if (improvements.length > 0) {
        console.log(`\n✅ IMPROVEMENTS (${improvements.length}):`);
        improvements.forEach((imp, idx) => {
            console.log(`   ${idx + 1}. ${imp.url}`);
            console.log(`      Rules: ${imp.rules.join(", ")}`);
        });
    }

    if (regressions.length > 0) {
        console.log(`\n⚠️ REGRESSIONS (${regressions.length}):`);
        regressions.forEach((reg, idx) => {
            console.log(`   ${idx + 1}. ${reg.url}`);
            console.log(`      Rules: ${reg.rules.join(", ")}`);
        });
    }

    console.log("\n" + "=".repeat(100));
    if (hybridCorrect > mlCorrect) {
        console.log("✅ HYBRID APPROACH IS BETTER - Use ML + Heuristics");
    } else if (hybridCorrect === mlCorrect) {
        console.log("⚖️ SAME ACCURACY - Heuristics didn't help or hurt");
    } else {
        console.log("⚠️ HYBRID APPROACH IS WORSE - Heuristics causing problems");
    }
    console.log("=".repeat(100));
}

compareMLvsHybrid();
