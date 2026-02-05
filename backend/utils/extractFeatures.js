const analyzeUrl = require("./urlChecks");
const getDomainAge = require("./whoisCheck");
const analyzeContent = require("./contentCheck");
const { URL } = require("url");

async function extractFeatures(url) {
    const urlAnalysis = analyzeUrl(url);
    if (urlAnalysis.error) {
        throw new Error(urlAnalysis.error);
    }

    const hostname = new URL(url).hostname;

    const domainAge = await getDomainAge(hostname);
    const contentAnalysis = await analyzeContent(url);

    return {
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
        has_password_input: contentAnalysis?.hasPassword ? 1 : 0
    };

}

module.exports = extractFeatures;
