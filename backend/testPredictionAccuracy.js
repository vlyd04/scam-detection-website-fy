const extractFeatures = require("./utils/extractFeatures");
const axios = require("axios");

// Real-world test cases with known labels
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

async function testPredictionAccuracy() {
    console.log("=".repeat(100));
    console.log("TESTING PREDICTION ACCURACY - Real World URLs");
    console.log("=".repeat(100));

    let correct = 0;
    let total = testCases.length;
    const failures = [];

    for (const testCase of testCases) {
        console.log(`\n🔍 Testing: ${testCase.url}`);
        console.log(`   Category: ${testCase.category}`);
        console.log(`   Expected: ${testCase.expected}`);

        try {
            // Extract features
            const features = await extractFeatures(testCase.url);

            // Get ML prediction
            const mlResult = await axios.post(
                "http://127.0.0.1:8001/predict",
                features,
                { timeout: 10000 }
            );

            const { confidence, prediction } = mlResult.data;
            const riskScore = Math.round(confidence * 100);

            const verdict = prediction === 1 ? "Scam" : "Legit";
            const isCorrect = verdict === testCase.expected;

            console.log(`   Prediction: ${verdict} (${riskScore}% risk, confidence: ${confidence})`);
            console.log(`   Result: ${isCorrect ? "✅ CORRECT" : "❌ WRONG"}`);

            // Show key features that influenced decision
            console.log(`   Key Features:`);
            console.log(`     - domain_age_days: ${features.domain_age_days}`);
            console.log(`     - brand_misuse: ${features.brand_misuse}`);
            console.log(`     - suspicious_tld: ${features.suspicious_tld}`);
            console.log(`     - has_ip: ${features.has_ip}`);
            console.log(`     - url_entropy: ${features.url_entropy}`);

            if (isCorrect) {
                correct++;
            } else {
                failures.push({
                    url: testCase.url,
                    expected: testCase.expected,
                    predicted: verdict,
                    confidence,
                    features
                });
            }

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            failures.push({
                url: testCase.url,
                expected: testCase.expected,
                predicted: "ERROR",
                error: error.message
            });
        }
    }

    console.log("\n" + "=".repeat(100));
    console.log("ACCURACY REPORT");
    console.log("=".repeat(100));
    console.log(`Correct Predictions: ${correct}/${total} (${((correct / total) * 100).toFixed(1)}%)`);
    console.log(`Failed Predictions: ${failures.length}`);

    if (failures.length > 0) {
        console.log("\n❌ FAILED PREDICTIONS:");
        console.log("-".repeat(100));
        failures.forEach((fail, idx) => {
            console.log(`\n${idx + 1}. ${fail.url}`);
            console.log(`   Expected: ${fail.expected}, Got: ${fail.predicted}`);
            if (fail.features) {
                console.log(`   Confidence: ${fail.confidence}`);
                console.log(`   Problem Features:`);

                // Identify problematic features
                if (fail.expected === "Legit" && fail.predicted === "Scam") {
                    console.log(`     - Model falsely flagged as scam`);
                    console.log(`     - brand_misuse: ${fail.features.brand_misuse} (may be triggering false positive)`);
                    console.log(`     - domain_age_days: ${fail.features.domain_age_days} (0 = unknown, not necessarily new)`);
                } else if (fail.expected === "Scam" && fail.predicted === "Legit") {
                    console.log(`     - Model failed to detect scam`);
                    console.log(`     - Missing strong scam signals`);
                }
            }
        });

        console.log("\n" + "=".repeat(100));
        console.log("DIAGNOSIS & RECOMMENDATIONS:");
        console.log("=".repeat(100));

        const legitFails = failures.filter(f => f.expected === "Legit" && f.predicted === "Scam").length;
        const scamFails = failures.filter(f => f.expected === "Scam" && f.predicted === "Legit").length;

        if (legitFails > 0) {
            console.log(`\n⚠️ False Positives (${legitFails}): Legitimate sites flagged as scam`);
            console.log(`   Likely Causes:`);
            console.log(`   - domain_age_days = 0 (WHOIS failed, treated as new domain)`);
            console.log(`   - brand_misuse = 1 (legitimate sites like google.com contain "google")`);
            console.log(`   - Model needs retraining with better feature weights`);
        }

        if (scamFails > 0) {
            console.log(`\n⚠️ False Negatives (${scamFails}): Scam sites not detected`);
            console.log(`   Likely Causes:`);
            console.log(`   - Training data insufficient for these scam patterns`);
            console.log(`   - Feature extraction missing key signals`);
            console.log(`   - Model needs more scam examples in training`);
        }

        console.log(`\n📝 Recommended Actions:`);
        console.log(`   1. Check WHOIS functionality - if domain_age_days always = 0, fix WHOIS lookup`);
        console.log(`   2. Retrain model with better dataset (more examples, balanced classes)`);
        console.log(`   3. Add context to brand_misuse (legitimate domains can contain brand names)`);
        console.log(`   4. Adjust threshold from 0.5 to optimize precision/recall balance`);
        console.log(`   5. Consider ensemble approach or additional heuristics`);
    } else {
        console.log("\n✅ All predictions correct! Model is working well.");
    }

    console.log("\n" + "=".repeat(100));
}

testPredictionAccuracy();
