from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    url = data.get("url", "")

    return jsonify({
        "prediction": "unknown",
        "confidence": 0.0
    })

if __name__ == "__main__":
    app.run(port=8000)
