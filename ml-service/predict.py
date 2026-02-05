from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load trained model
model = joblib.load("scam_model.pkl")

FEATURE_ORDER = [
    "url_length",
    "digit_count",
    "special_char_count",
    "has_ip",
    "subdomain_count",
    "has_https",
    "suspicious_tld",
    "domain_age_days",
    "keyword_density",
    "has_password_input"
]

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    try:
        features = []
        missing = []

        for f in FEATURE_ORDER:
            if f not in data:
                missing.append(f)
                features.append(0)
            else:
                features.append(data[f])

        if missing:
            print("Missing features:", missing)
        features = np.array(features).reshape(1, -1)

        probability = model.predict_proba(features)[0][1]
        prediction = int(probability >= 0.5)

        return jsonify({
            "prediction": prediction,
            "probability": round(float(probability), 4)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(port=5001)
