const extractFeatures = require("./utils/extractFeatures");

// Test URLs
const testUrls = [
    "https://foma-ura-lote.firebaseapp.com/"
];

async function testFeatureExtraction() {
    console.log("=".repeat(80));
    console.log("TESTING FEATURE EXTRACTION");
    console.log("=".repeat(80));

    for (const url of testUrls) {
        console.log(`\n🔍 Testing URL: ${url}\n`);

        try {
            // Import helper functions to debug individually
            const analyzeUrl = require("./utils/urlChecks");
            const getDomainAge = require("./utils/whoisCheck");
            const analyzeContent = require("./utils/contentCheck");

            const hostname = new URL(url).hostname;

            console.log("📋 DEBUG: Helper function outputs:");
            console.log("  URL Analysis:", analyzeUrl(url));

            const domainAge = await getDomainAge(hostname);
            console.log("  WHOIS Result:", domainAge);

            const contentAnalysis = await analyzeContent(url);
            console.log("  Content Analysis:", contentAnalysis);
            console.log("");

            const features = await extractFeatures(url);

            console.log("Extracted Features:");
            console.log("-".repeat(80));

            console.log(`  url_length:           ${features.url_length}`);
            console.log(`  digit_count:          ${features.digit_count}`);
            console.log(`  special_char_count:   ${features.special_char_count}`);
            console.log(`  has_ip:               ${features.has_ip}`);
            console.log(`  subdomain_count:      ${features.subdomain_count}`);
            console.log(`  has_https:            ${features.has_https}`);
            console.log(`  suspicious_tld:       ${features.suspicious_tld}`);
            console.log(`  domain_age_days:      ${features.domain_age_days}`);
            console.log(`  keyword_density:      ${features.keyword_density}`);
            console.log(`  has_password_input:   ${features.has_password_input}`);
            console.log(`  url_entropy:          ${features.url_entropy}`);
            console.log(`  brand_misuse:         ${features.brand_misuse}`);
            console.log(`  path_depth:           ${features.path_depth}`);
            console.log(`  redirect_count:       ${features.redirect_count}`);

            console.log("\n" + "=".repeat(80));

        } catch (error) {
            console.error(`  ❌ Error: ${error.message}\n`);
        }
    }
}

testFeatureExtraction();
