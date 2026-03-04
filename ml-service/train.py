
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

# Load dataset
df = pd.read_csv("../backend/data/scam_dataset.csv")

# Fix domain age
df["domain_age_days"] = df["domain_age_days"].replace(-1, 0)

X = df.drop(columns=["label"])
y = df["label"]

# Lock feature order
feature_names = list(X.columns)
X = X[feature_names]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.3,
    random_state=42,
    stratify=y
)

# Train model
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1,
    class_weight="balanced"
)

model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

# Save model + metadata
artifact = {
    "model": model,
    "features": feature_names,
    "feature_importance": dict(zip(feature_names, model.feature_importances_))
}

joblib.dump(artifact, "scam_model.pkl")
print("Model + feature metadata saved successfully")