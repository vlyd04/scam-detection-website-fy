const analyzeUrl = require("./urlChecks");
const getDomainAge = require("./whoisCheck");
const analyzeContent = require("./contentCheck");
const { URL } = require("url");

/* ---------- NEW FEATURE HELPERS ---------- */

// 1. URL entropy
function calculateEntropy(str) {
    if (!str) return 0;

    const freq = {};
    for (const c of str) {
        freq[c] = (freq[c] || 0) + 1;
    }

    let entropy = 0;
    const len = str.length;

    for (const c in freq) {
        const p = freq[c] / len;
        entropy -= p * Math.log2(p);
    }

    return Number(entropy.toFixed(3));
}

/* ---------- BRAND MISUSE (FIXED LOGIC) ---------- */

// Strict brand list (real brands only)
const BRAND_KEYWORDS = [
    "paypal",
    "google",
    "amazon",
    "microsoft",
    "apple",
    "facebook",
    "instagram",
    "netflix",
    "bankofamerica",
    "hdfcbank",
    "sbi"
];

// Extract hostname safely
function extractHostname(url) {
    try {
        return new URL(url).hostname.toLowerCase();
    } catch {
        return null;
    }
}

// Extract root domain safely
function getRootDomain(hostname) {
    if (!hostname) return null;

    // IP address case
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return hostname;
    }

    const parts = hostname.split(".");
    if (parts.length >= 2) {
        return parts.slice(-2).join(".");
    }

    return hostname;
}

// Detect brand impersonation in DOMAIN ONLY
function detectBrandMisuse(url) {
    const hostname = extractHostname(url);
    if (!hostname) return 0;

    const cleanHost = hostname.replace(/^www\./, "");

    for (const brand of BRAND_KEYWORDS) {

        if (cleanHost.includes(brand)) {

            // Legitimate exact match allowed
            if (
                cleanHost === `${brand}.com` ||
                cleanHost.endsWith(`.${brand}.com`)
            ) {
                return 0;
            }

            return 1; // suspicious usage
        }
    }

    return 0;
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

async function extractFeatures(url) {

    const urlAnalysis = analyzeUrl(url);
    if (urlAnalysis.error) {
        throw new Error(urlAnalysis.error);
    }

    const hostname = extractHostname(url);
    const rootDomain = getRootDomain(hostname);

    const domainAge = rootDomain
        ? await getDomainAge(rootDomain)
        : null;

    const contentAnalysis = await analyzeContent(url);

    return {
        /* URL-based features */
        url_length: url?.length || 0,
        digit_count: urlAnalysis?.digitCount || 0,
        special_char_count: urlAnalysis?.specialCharCount || 0,
        has_ip: urlAnalysis?.hasIP ? 1 : 0,
        subdomain_count: urlAnalysis?.subdomainCount || 0,
        has_https: url?.startsWith("https") ? 1 : 0,
        suspicious_tld: urlAnalysis?.suspiciousTLD ? 1 : 0,
        url_entropy: calculateEntropy(url),
        path_depth: getPathDepth(url),

        /* Domain features */
        domain_age_days:
            typeof domainAge?.ageDays === "number"
                ? domainAge.ageDays
                : null,  /* When WHOIS fails, treat as unknown (null prevents false age-based positives) */

        brand_misuse: detectBrandMisuse(url),

        /* Content features */
        keyword_density:
            typeof contentAnalysis?.keywordDensity === "number"
                ? contentAnalysis.keywordDensity
                : 0,

        has_password_input:
            contentAnalysis?.hasPassword ? 1 : 0,

        /* Known limitation (documented) */
        redirect_count: 0
    };
}

module.exports = extractFeatures;