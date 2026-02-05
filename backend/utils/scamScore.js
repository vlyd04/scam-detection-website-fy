function calculateScamScore({ urlAnalysis, domainAge, contentAnalysis }) {
    let score = 0;
    const reasons = [];

    // URL heuristics
    if (!urlAnalysis.hasHttps) {
        score += 20;
        reasons.push("No HTTPS");
    }

    if (urlAnalysis.hasIp) {
        score += 30;
        reasons.push("IP-based URL");
    }

    if (urlAnalysis.hyphenCount > 2) {
        score += 15;
        reasons.push("Excessive hyphens in domain");
    }

    if (urlAnalysis.suspiciousTld) {
        score += 25;
        reasons.push("Suspicious top-level domain");
    }

    // Domain age
    if (domainAge?.isNewDomain) {
        score += 30;
        reasons.push("New or recently registered domain");
    }

    if (domainAge?.warning) {
        score += 20;
        reasons.push("WHOIS data hidden");
    }

    // Content analysis
    if (contentAnalysis?.keywordCount > 0) {
        score += contentAnalysis.keywordCount * 5;
        reasons.push("Scam-related keywords found");
    }

    if (contentAnalysis?.hasPasswordInput) {
        score += 20;
        reasons.push("Password input detected");
    }

    if (contentAnalysis?.hasPaymentWords) {
        score += 20;
        reasons.push("Payment-related content detected");
    }

    if (contentAnalysis?.blocked) {
        score += 15;
        reasons.push("Website blocked automated inspection");
    }

    // Cap score at 100
    if (score > 100) score = 100;

    let verdict = "Safe";
    if (score >= 70) verdict = "Scam";
    else if (score >= 40) verdict = "Suspicious";

    return { score, verdict, reasons };
}

module.exports = calculateScamScore;
