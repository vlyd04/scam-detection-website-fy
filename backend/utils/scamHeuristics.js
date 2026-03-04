/**
 * Rule-based heuristics to catch obvious scam patterns
 * IMPROVED: Better categorization and balanced weights
 * 
 * KEY IMPROVEMENTS:
 * 1. Tiered keyword system (only high-confidence scam words penalize heavily)
 * 2. Higher threshold for keyword-based penalties 
 * 3. E-commerce site detection with reduced penalties
 * 4. Balanced weight distribution across all heuristics
 * 5. Strong legit indicators to override weak scam signals
 */


function isNewDomain(ageDays) {
    return typeof ageDays === "number" && ageDays < 180;
}

function isYoungDomain(ageDays) {
    return typeof ageDays === "number" && ageDays <= 365;
}

function isOldDomain(ageDays) {
    return typeof ageDays === "number" && ageDays > 1825;
}

function isVeryOldDomain(ageDays) {
    return typeof ageDays === "number" && ageDays > 3650;
}


function applyScamHeuristics(features, mlPrediction, mlConfidence) {
    let finalConfidence = mlConfidence;
    let heuristicBoost = 0;
    const reasons = [];

    // ===== STRONG SCAM INDICATORS (high confidence) =====

    // Rule 1: IP-based URL = almost always scam
    if (features.has_ip === 1) {
        heuristicBoost += 0.4;
        reasons.push("IP-based URL (strong scam indicator)");
    }

    // Rule 2: Suspicious TLD + Brand misuse + New/Unknown domain = phishing
    if (features.suspicious_tld === 1 &&
        features.brand_misuse === 1 &&
        isYoungDomain(features.domain_age_days)) {
        heuristicBoost += 0.15;  // REDUCED from 0.4
        reasons.push("Suspicious TLD + Brand name + New/Unknown domain (phishing pattern)");
    }

    // Rule 2b: Suspicious TLD + Brand misuse ALONE = risky (typosquatting)
    const brandTldCombo = features.suspicious_tld === 1 &&
        features.brand_misuse === 1;

    if (brandTldCombo && !isYoungDomain(features.domain_age_days)) {
        heuristicBoost += 0.1;  // REDUCED from 0.25
        reasons.push("Suspicious TLD combined with brand name (typosquatting risk)");
    }

    // Rule 3: High URL entropy + Suspicious TLD
    // REDUCED boost - high entropy alone doesn't mean scam
    if (features.url_entropy > 4.5 && features.suspicious_tld === 1) {
        heuristicBoost += 0.1;  // Reduced from 0.25
        reasons.push("High URL randomness + Suspicious TLD");
    }

    // Rule 4: Password input + Brand misuse + suspicion indicators
    // DISABLED - legitimate e-commerce sites have login pages
    // This rule caused too many false positives on real shopping sites
    if (false && features.has_password_input === 1 &&
        features.brand_misuse === 1 &&
        (features.suspicious_tld === 1 || features.domain_age_days < 180)) {
        heuristicBoost += 0.15;
        reasons.push("Login page + Brand name on suspicious/new domain");
    }

    // ===== IMPROVED Rule 5: Weighted keyword density (much stricter) =====
    // FIXED: Previously used all keywords (13 total, including marketing words)
    // NOW: Only uses high-confidence scam keywords (10 tier-1 + tier-2 weighted)
    // THRESHOLD: Requires multiple strong tier-1 indicators OR strong tier-2 combination
    
    // keywordDensity is now a WEIGHTED score (0-1) not a count ratio
    // Only flag if TRULY SUSPICIOUS language present
    if (features.keyword_density > 0.5) {
        // Multiple strong scam keywords present
        heuristicBoost += 0.15;
        reasons.push("Strong scam-related keyword patterns detected");
    } else if (features.keyword_density > 0.3) {
        // Some scam indicators but not conclusive
        heuristicBoost += 0.08;
        reasons.push("Moderate scam-related keyword presence");
    }

    // NOTE: Generic marketing language ("limited time", "act now", etc) NO LONGER PENALIZES
    // This eliminates false positives on legitimate e-commerce sites

    if (features.domain_age_days === null) {
        reasons.push("Domain age unavailable (treated as neutral)");
    }

    // ===== LEGIT INDICATORS (confidence reduction) =====

    // Rule 6a: Very old domain (> 10 years) + HTTPS + no brand misuse = likely legit
    if (isVeryOldDomain(features.domain_age_days) && 
        features.has_https === 1) {
        heuristicBoost -= 0.35;
        reasons.push("Very old domain (10+ years) with HTTPS (legitimate business)");
    }

    // Rule 6b: Old domain (> 5 years) + HTTPS + no suspicious signals = legit
    if (isOldDomain(features.domain_age_days) &&
        features.has_https === 1 &&
        features.suspicious_tld === 0 &&
        features.has_ip === 0 &&
        features.brand_misuse === 0) {
        heuristicBoost -= 0.3;
        reasons.push("Established domain (5+ years) with HTTPS and no suspicious flags");
    }

    // Rule 7: Old domain + no suspicious signals = legit
    if (isOldDomain(features.domain_age_days) &&
        features.suspicious_tld === 0 &&
        features.has_ip === 0 &&
        features.brand_misuse === 0 &&
        features.has_password_input === 0) {
        heuristicBoost -= 0.25;
        reasons.push("Established domain with clean profile");
    }

    // Rule 8: Very low keyword density + HTTPS + old domain = override suspicion
    if (features.has_https === 1 &&
        isVeryOldDomain(features.domain_age_days) &&
        features.keyword_density <= 0.1) {
        if (heuristicBoost > 0) {
            heuristicBoost *= 0.4;  // Reduce ANY suspicion boost by 60%
            reasons.push("Strong legitimacy signals override weak suspicions");
        }
    }

    // Rule 9: E-commerce site detected = reduce keyword-based penalties
    if (features.is_ecommerce_site === 1 && heuristicBoost > 0) {
        heuristicBoost *= 0.5;  // Cut heuristic boost in half for known e-commerce
        reasons.push("Known e-commerce platform (keyword penalties reduced)");
    }

    // ===== APPLY BOUNDS AND CALCULATE FINAL CONFIDENCE =====

    const MAX_HEURISTIC_BOOST = 0.5;
    const MIN_HEURISTIC_BOOST = -0.5;
    
    heuristicBoost = Math.max(MIN_HEURISTIC_BOOST, Math.min(MAX_HEURISTIC_BOOST, heuristicBoost));
    
    // Apply heuristic boost: Give more weight to ML prediction
    // ML confidence = 80% of result, heuristics = 20% of result
    const ML_WEIGHT = 0.8;
    const HEURISTIC_WEIGHT = 0.2;
    
    finalConfidence = (mlConfidence * ML_WEIGHT) + 
                      ((mlConfidence + heuristicBoost) * HEURISTIC_WEIGHT);

    // Clamp to 0-1 range
    finalConfidence = Math.max(0, Math.min(1, finalConfidence));

    // Determine final prediction (threshold: 0.5)
    const finalPrediction = finalConfidence >= 0.5 ? 1 : 0;

    return {
        originalConfidence: mlConfidence,
        originalPrediction: mlPrediction,
        heuristicBoost,
        finalConfidence: parseFloat(finalConfidence.toFixed(4)),
        finalPrediction,
        appliedRules: reasons,
        method: reasons.length > 0 ? "ML + Heuristics" : "ML Only"
    };
}

module.exports = applyScamHeuristics;