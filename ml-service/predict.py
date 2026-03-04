# from flask import Flask, request, jsonify
# import joblib
# import numpy as np

# app = Flask(__name__)

# # Load trained model
# model = joblib.load("scam_model.pkl")

# FEATURE_ORDER = [
#     "url_length",
#     "digit_count",
#     "special_char_count",
#     "has_ip",
#     "subdomain_count",
#     "has_https",
#     "suspicious_tld",
#     "domain_age_days",
#     "keyword_density",
#     "has_password_input"
# ]

# @app.route("/predict", methods=["POST"])
# def predict():
#     data = request.json

#     try:
#         features = []
#         missing = []

#         for f in FEATURE_ORDER:
#             if f not in data:
#                 missing.append(f)
#                 features.append(0)
#             else:
#                 features.append(data[f])

#         if missing:
#             print("Missing features:", missing)
#         features = np.array(features).reshape(1, -1)

#         probability = model.predict_proba(features)[0][1]
#         prediction = int(probability >= 0.5)

#         return jsonify({
#             "prediction": prediction,
#             "probability": round(float(probability), 4)
#         })

#     except Exception as e:
#         return jsonify({"error": str(e)}), 400


# if __name__ == "__main__":
#     app.run(port=5001)


import numpy as np
import joblib

artifact = joblib.load("scam_model.pkl")

model = artifact["model"]
feature_names = artifact["features"]
feature_importance = artifact["feature_importance"]

TOP_K = 5


def predict_with_explanation(feature_dict):
    # Build ordered feature vector
    X = np.array([[feature_dict[f] for f in feature_names]])

    # Prediction
    prob = model.predict_proba(X)[0][1]
    pred = int(prob >= 0.5)

    # Instance-weighted contribution (approximation)
    contributions = X[0] * np.array(
        [feature_importance.get(f, 0) for f in feature_names]
    )

    # Pick strongest contributors for THIS URL
    top = sorted(
        zip(feature_names, contributions, X[0]),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:TOP_K]

    explanations = []
    for name, impact, value in top:
        if impact == 0:
            continue

        explanations.append({
            "feature": name,
            "value": value,
            "impact": round(float(impact), 4),
            "direction": "increase_risk" if impact > 0 else "reduce_risk"
        })

    return {
        "prediction": pred,
        "confidence": round(float(prob), 4),
        "explanations": explanations
    }

def explain_feature(feature, value):
    """
    Human-readable explanation aligned with real model behavior
    """

    explanations_map = {
        "url_length": "Unusually long URLs are commonly used to hide malicious intent",
        "url_entropy": "High randomness in the URL indicates obfuscation techniques",
        "path_depth": "Deep URL paths are often used to mimic legitimate pages",
        "has_https": "HTTPS alone does not guarantee legitimacy",
        "brand_misuse": "Use of well-known brand names inside URLs is a phishing tactic"
    }

    return explanations_map.get(
        feature,
        "This feature contributed to the model decision"
    )