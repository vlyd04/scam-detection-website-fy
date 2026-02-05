/**
 * Dataset Generation Script
 * -------------------------
 * Reads scam & legit URLs
 * Extracts features
 * Writes ML-ready CSV
 *
 * DEBUG ENABLED
 */
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

// Feature utilities (must already exist)
const { extractUrlFeatures } = require("../utils/urlFeatures");
const { getDomainAgeDays } = require("../utils/whoisUtils");
const { extractContentFeatures } = require("../utils/contentUtils");

// ========== DEBUG: ENTRY POINT ==========
console.log("=== Dataset generation script started ===");
console.log("Working directory:", process.cwd());
console.log("Script directory:", __dirname);

// ========== PATH SETUP ==========
const scamFilePath = path.join(__dirname, "scam_urls.txt");
const legitFilePath = path.join(__dirname, "legit_urls.txt");
const outputFilePath = path.join(__dirname, "../data/scam_dataset.csv");


// ========== SAFETY CHECKS ==========
if (!fs.existsSync(scamFilePath)) {
    console.error("❌ scam_urls.txt not found at:", scamFilePath);
    process.exit(1);
}

if (!fs.existsSync(legitFilePath)) {
    console.error("❌ legit_urls.txt not found at:", legitFilePath);
    process.exit(1);
}

// ========== CORE PROCESSING FUNCTION ==========
async function processUrl(rawUrl, label) {
    try {
        console.log(`\n➡️ Processing (${label === 1 ? "SCAM" : "LEGIT"}):`, rawUrl);

        const parsed = new URL(rawUrl);
        const hostname = parsed.hostname;

        // URL-based features
        const urlFeatures = extractUrlFeatures(rawUrl);
        console.log("   URL features extracted");

        // Domain-based features
        const domainAge = await getDomainAgeDays(hostname);
        console.log("   Domain age:", domainAge);

        // Content-based features
        const contentFeatures = await extractContentFeatures(rawUrl);
        console.log("   Content features extracted");

        return {
            ...urlFeatures,
            domain_age_days: domainAge,
            ...contentFeatures,
            label
        };
    } catch (err) {
        console.error("❌ Failed to process URL:", rawUrl);
        console.error("   Reason:", err.message);

        // Return null so caller can skip
        return null;
    }
}

// ========== MAIN GENERATION FUNCTION ==========
async function generateDataset() {
    console.log("\n📥 Reading URL files...");

    const scamUrls = fs
        .readFileSync(scamFilePath, "utf-8")
        .split("\n")
        .map(u => u.trim())
        .filter(Boolean);

    const legitUrls = fs
        .readFileSync(legitFilePath, "utf-8")
        .split("\n")
        .map(u => u.trim())
        .filter(Boolean);

    console.log(`   Scam URLs loaded: ${scamUrls.length}`);
    console.log(`   Legit URLs loaded: ${legitUrls.length}`);

    const rows = [];

    // Process scam URLs
    for (const url of scamUrls) {
        const row = await processUrl(url, 1);
        if (row) rows.push(row);
    }

    // Process legit URLs
    for (const url of legitUrls) {
        const row = await processUrl(url, 0);
        if (row) rows.push(row);
    }

    if (rows.length === 0) {
        console.error("❌ No rows generated. Dataset is empty.");
        process.exit(1);
    }

    console.log(`\n🧮 Total rows generated: ${rows.length}`);

    // ========== CSV CREATION ==========
    const headers = Object.keys(rows[0]).join(",");
    const csvLines = rows.map(row =>
        Object.values(row)
            .map(v => (v === null || v === undefined ? "" : v))
            .join(",")
    );

    const csvContent = headers + "\n" + csvLines.join("\n");

    fs.writeFileSync(outputFilePath, csvContent);

    console.log("\n✅ Dataset written successfully:");
    console.log("   File:", outputFilePath);
}

// ========== SAFE EXECUTION ==========
(async () => {
    try {
        await generateDataset();
        console.log("\n🎉 Dataset generation completed successfully");
    } catch (err) {
        console.error("\n🔥 Fatal error during dataset generation");
        console.error(err);
        process.exit(1);
    }
})();
