const analyzeUrl = require("./urlChecks");
const getDomainAge = require("./whoisCheck");
const analyzeContent = require("./contentCheck");
const { URL } = require("url");

/* ---------- NEW FEATURE HELPERS ---------- */

// 1. URL entropy
function calculateEntropy(str) {
    const freq = {};
    for (const c of str) freq[c] = (freq[c] || 0) + 1;

    let entropy = 0;
    const len = str.length;

    for (const c in freq) {
        const p = freq[c] / len;
        entropy -= p * Math.log2(p);
    }
    return Number(entropy.toFixed(3));
}

// 2. Brand misuse
const BRAND_KEYWORDS = [
    "paypal", "google", "amazon", "microsoft",
    "bank", "upi", "secure", "login", "verify"
];

function detectBrandMisuse(url) {
    const lower = url.toLowerCase();
    return BRAND_KEYWORDS.some(b => lower.includes(b)) ? 1 : 0;
}

// 3. Path depth
function getPathDepth(url) {
    try {
        const pathname = new URL(url).pathname;
        return pathname.split("/").filter(Boolean).length;
    } catch {
        return 0;
    }
}

/* ---------- MAIN FEATURE EXTRACTION ---------- */

// Helper to extract root domain (without subdomains)
function getRootDomain(hostname) {
    const parts = hostname.split('.');

    // Handle IP addresses
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return hostname;
    }

    // For domains like example.com, www.example.com, sub.example.com
    // Take last 2 parts (example.com)
    if (parts.length >= 2) {
        return parts.slice(-2).join('.');
    }

    return hostname;
}

async function extractFeatures(url) {
    const urlAnalysis = analyzeUrl(url);
    if (urlAnalysis.error) {
        throw new Error(urlAnalysis.error);
    }

    const hostname = new URL(url).hostname;
    const rootDomain = getRootDomain(hostname);

    const domainAge = await getDomainAge(rootDomain);
    const contentAnalysis = await analyzeContent(url);

    return {
        // Existing features
        url_length: url.length || 0,
        digit_count: urlAnalysis.digitCount || 0,
        special_char_count: urlAnalysis.specialCharCount || 0,
        has_ip: urlAnalysis.hasIP ? 1 : 0,
        subdomain_count: urlAnalysis.subdomainCount || 0,
        has_https: url.startsWith("https") ? 1 : 0,
        suspicious_tld: urlAnalysis.suspiciousTLD ? 1 : 0,
        domain_age_days:
            typeof domainAge?.ageDays === "number" ? domainAge.ageDays : -1,
        keyword_density:
            typeof contentAnalysis?.keywordDensity === "number"
                ? contentAnalysis.keywordDensity
                : 0,
        has_password_input: contentAnalysis?.hasPassword ? 1 : 0,

        // ✅ NEW FEATURES
        url_entropy: calculateEntropy(url),
        brand_misuse: detectBrandMisuse(url),
        path_depth: getPathDepth(url),
        redirect_count: 0   // intentionally fixed (documented limitation)
    };
}

module.exports = extractFeatures;