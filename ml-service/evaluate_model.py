"""
Model Evaluation Script
-----------------------
Displays comprehensive metrics for the trained scam detection model:
- Accuracy
- Precision
- Recall
- F1-Score
- Confusion Matrix
- ROC-AUC Score
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report, 
    confusion_matrix, 
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score
)
import joblib
import numpy as np

print("=" * 80)
print("SCAM DETECTION MODEL - PERFORMANCE METRICS")
print("=" * 80)

# Load dataset
print("\n📊 Loading dataset...")
df = pd.read_csv("../backend/data/scam_dataset.csv")
df["domain_age_days"] = df["domain_age_days"].replace(-1, 0)

X = df.drop(columns=["label"])
y = df["label"]

print(f"   Total samples: {len(df)}")
print(f"   Scam samples: {(y == 1).sum()} ({(y == 1).sum() / len(y) * 100:.1f}%)")
print(f"   Legit samples: {(y == 0).sum()} ({(y == 0).sum() / len(y) * 100:.1f}%)")

# Split (same as training)
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.3,
    random_state=42,
    stratify=y
)

print(f"\n📈 Test set size: {len(X_test)} samples")

# Load trained model
print("\n🤖 Loading trained model...")
artifact = joblib.load("scam_model.pkl")
model = artifact["model"]
print("   ✅ Model loaded successfully")

# Make predictions
print("\n🔮 Making predictions...")
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)[:, 1]  # Probability of scam class

# Calculate metrics
print("\n" + "=" * 80)
print("PERFORMANCE METRICS")
print("=" * 80)

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='binary')
recall = recall_score(y_test, y_pred, average='binary')
f1 = f1_score(y_test, y_pred, average='binary')
roc_auc = roc_auc_score(y_test, y_pred_proba)

print(f"\n✅ Overall Accuracy:  {accuracy:.4f} ({accuracy * 100:.2f}%)")
print(f"🎯 Precision (Scam): {precision:.4f} ({precision * 100:.2f}%)")
print(f"📊 Recall (Scam):    {recall:.4f} ({recall * 100:.2f}%)")
print(f"⚖️  F1-Score (Scam):  {f1:.4f} ({f1 * 100:.2f}%)")
print(f"📈 ROC-AUC Score:    {roc_auc:.4f} ({roc_auc * 100:.2f}%)")

# Detailed classification report
print("\n" + "=" * 80)
print("DETAILED CLASSIFICATION REPORT")
print("=" * 80)
print("\nClass Labels: 0 = Legit, 1 = Scam\n")
print(classification_report(y_test, y_pred, target_names=['Legit', 'Scam']))

# Confusion Matrix
print("\n" + "=" * 80)
print("CONFUSION MATRIX")
print("=" * 80)
cm = confusion_matrix(y_test, y_pred)
print("\nActual →  |  Predicted Legit  |  Predicted Scam")
print("-" * 55)
print(f"Legit     |       {cm[0][0]:4d}        |       {cm[0][1]:4d}")
print(f"Scam      |       {cm[1][0]:4d}        |       {cm[1][1]:4d}")

# Calculate derived metrics
tn, fp, fn, tp = cm.ravel()
print(f"\n📊 Breakdown:")
print(f"   True Negatives (Legit → Legit):   {tn:4d}")
print(f"   False Positives (Legit → Scam):   {fp:4d}  ⚠️")
print(f"   False Negatives (Scam → Legit):   {fn:4d}  ⚠️")
print(f"   True Positives (Scam → Scam):     {tp:4d}")

# Error analysis
print("\n" + "=" * 80)
print("ERROR ANALYSIS")
print("=" * 80)
false_positive_rate = fp / (fp + tn) if (fp + tn) > 0 else 0
false_negative_rate = fn / (fn + tp) if (fn + tp) > 0 else 0

print(f"\n⚠️  False Positive Rate: {false_positive_rate:.4f} ({false_positive_rate * 100:.2f}%)")
print(f"    (Legit sites flagged as scam)")
print(f"\n⚠️  False Negative Rate: {false_negative_rate:.4f} ({false_negative_rate * 100:.2f}%)")
print(f"    (Scam sites not detected)")

# Feature importance
print("\n" + "=" * 80)
print("TOP 10 MOST IMPORTANT FEATURES")
print("=" * 80)

feature_importance = artifact["feature_importance"]
sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)

print("\nRank | Feature                  | Importance")
print("-" * 55)
for i, (feature, importance) in enumerate(sorted_features[:10], 1):
    print(f"{i:2d}.  | {feature:24s} | {importance:.4f}")

# Model configuration
print("\n" + "=" * 80)
print("MODEL CONFIGURATION")
print("=" * 80)
print(f"\nAlgorithm: Random Forest Classifier")
print(f"Number of Trees: {model.n_estimators}")
print(f"Max Depth: {model.max_depth if model.max_depth else 'Unlimited'}")
print(f"Class Weight: {model.class_weight}")
print(f"Random State: {model.random_state}")

# Summary & Interpretation
print("\n" + "=" * 80)
print("INTERPRETATION")
print("=" * 80)

print(f"\n✅ Model achieves {accuracy * 100:.1f}% overall accuracy on test set")
print(f"✅ Precision of {precision * 100:.1f}% means when model flags a URL as scam,")
print(f"   it's correct {precision * 100:.1f}% of the time")
print(f"✅ Recall of {recall * 100:.1f}% means the model catches {recall * 100:.1f}% of actual scams")
print(f"✅ F1-Score of {f1 * 100:.1f}% represents balanced performance")

if precision > 0.85:
    print(f"\n🎉 Excellent precision - Low false alarm rate")
elif precision > 0.70:
    print(f"\n👍 Good precision - Acceptable false alarm rate")
else:
    print(f"\n⚠️  Moderate precision - Consider threshold tuning")

if recall > 0.85:
    print(f"🎉 Excellent recall - Catches most scams")
elif recall > 0.70:
    print(f"👍 Good recall - Catches majority of scams")
else:
    print(f"⚠️  Moderate recall - Some scams may slip through")

print("\n" + "=" * 80)
