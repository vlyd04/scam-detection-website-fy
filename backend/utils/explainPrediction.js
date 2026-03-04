function explainPrediction(features, importanceMap, threshold = 0.05) {
    const reasons = [];

    for (const [feature, importance] of Object.entries(importanceMap)) {
        if (importance >= threshold && features[feature]) {
            reasons.push(feature.replace(/_/g, " "));
        }
    }

    return reasons.slice(0, 3); // top 3 reasons
}

module.exports = explainPrediction;