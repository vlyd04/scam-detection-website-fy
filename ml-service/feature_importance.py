import joblib
import pandas as pd
import matplotlib.pyplot as plt

MODEL_PATH = "scam_model.pkl"

def main():
    print("🔍 Loading trained model artifact...")

    artifact = joblib.load(MODEL_PATH)
    model = artifact["model"]
    feature_names = artifact["features"]

    print("✅ Model loaded")
    print(f"Total features: {len(feature_names)}")

    # Extract feature importance
    importances = model.feature_importances_

    df = pd.DataFrame({
        "Feature": feature_names,
        "Importance": importances
    }).sort_values(by="Importance", ascending=False)

    print("\n📊 Feature Importance Ranking:\n")
    print(df.to_string(index=False))

    # Plot
    plt.figure(figsize=(10, 6))
    plt.barh(df["Feature"], df["Importance"])
    plt.xlabel("Importance Score")
    plt.ylabel("Feature")
    plt.title("Feature Importance – Scam Detection Model")
    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    main()