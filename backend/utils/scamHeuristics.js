/**
 * Rule-based heuristics to catch obvious scam patterns
 * This supplements the ML model to improve accuracy
 */

function applyScamHeuristics(features, mlPrediction, mlConfidence) {
    let finalConfidence = mlConfidence;
    let heuristicBoost = 0;
    const reasons = [];

    // STRONG SCAM INDICATORS (high confidence boost)

    // Rule 1: IP-based URL = almost always scam
    if (features.has_ip === 1) {
        heuristicBoost += 0.4;
        reasons.push("IP-based URL (strong scam indicator)");
    }

    // Rule 2: Suspicious TLD + Brand misuse + New/Unknown domain = likely phishing
    if (features.suspicious_tld === 1 &&
        features.brand_misuse === 1 &&
        features.domain_age_days <= 365) {
        heuristicBoost += 0.45;
        reasons.push("Suspicious TLD + Brand name + New/Unknown domain (phishing pattern)");
    }

    // Rule 2b: Suspicious TLD + Brand misuse ALONE = risky (catches typosquatting)
    if (features.suspicious_tld === 1 && features.brand_misuse === 1) {
        heuristicBoost += 0.3;
        reasons.push("Suspicious TLD combined with brand name (typosquatting risk)");
    }

    // Rule 3: High URL entropy + Suspicious TLD
    if (features.url_entropy > 4.5 && features.suspicious_tld === 1) {
        heuristicBoost += 0.25;
        reasons.push("High URL randomness + Suspicious TLD");
    }

    // Rule 4: Password input + Brand misuse + suspicion indicators
    if (features.has_password_input === 1 &&
        features.brand_misuse === 1 &&
        (features.suspicious_tld === 1 || features.domain_age_days < 180)) {
        heuristicBoost += 0.3;
        reasons.push("Login page + Brand name on suspicious/new domain");
    }

    // Rule 5: High scam keyword density
    if (features.keyword_density > 0.4) {
        heuristicBoost += 0.2;
        reasons.push("High density of scam-related keywords");
    }

    // LEGIT INDICATORS (confidence reduction for false positives)

    // Rule 6: Very old domain (> 10 years) + HTTPS = likely legit
    if (features.domain_age_days > 3650 && features.has_https === 1) {
        heuristicBoost -= 0.3;
        reasons.push("Very old domain with HTTPS (likely legitimate)");
    }

    // Rule 7: Old domain (> 5 years) + no suspicious signals
    if (features.domain_age_days > 1825 &&
        features.suspicious_tld === 0 &&
        features.has_ip === 0 &&
        features.brand_misuse === 0) {
        heuristicBoost -= 0.25;
        reasons.push("Established domain with no suspicious signals");
    }

    // Rule 8: Strong legitimate signals override most suspicion
    if (features.domain_age_days > 2000 && features.has_https === 1 && features.keyword_density === 0) {
        if (heuristicBoost > 0) {
            heuristicBoost *= 0.5;  // Reduce suspicion boost by half
            reasons.push("Old HTTPS domain reduces suspicion");
        }
    }

    // Apply heuristic boost to ML confidence
    finalConfidence = Math.max(0, Math.min(1, mlConfidence + heuristicBoost));

    // Determine final prediction based on adjusted confidence (threshold: 0.5)
    const finalPrediction = finalConfidence >= 0.5 ? 1 : 0;

    return {
        originalConfidence: mlConfidence,
        originalPrediction: mlPrediction,
        heuristicBoost,
        finalConfidence: parseFloat(finalConfidence.toFixed(4)),
        finalPrediction,
        appliedRules: reasons,
        method: heuristicBoost !== 0 ? "ML + Heuristics" : "ML Only"
    };
}

module.exports = applyScamHeuristics;
