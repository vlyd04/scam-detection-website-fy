import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve, auc
import pandas as pd
from sklearn.model_selection import train_test_split
import joblib

# Load dataset
df = pd.read_csv("../backend/data/scam_dataset.csv")
df["domain_age_days"] = df["domain_age_days"].replace(-1, 0)

X = df.drop(columns=["label"])
y = df["label"]

# Split (same as training)
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.3,
    random_state=42,
    stratify=y
)

# Load trained model
artifact = joblib.load("scam_model.pkl")
model = artifact["model"]

# Get predicted probabilities
y_pred_proba = model.predict_proba(X_test)[:, 1]

# Compute ROC curve and ROC area
fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
roc_auc = auc(fpr, tpr)

# Plot ROC curve
plt.figure(figsize=(8, 6))
plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.4f})')
plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', label='Random classifier')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic (ROC) Curve')
plt.legend(loc="lower right")
plt.grid(True, alpha=0.3)

# Save the plot
plt.savefig('roc_curve.png', dpi=300, bbox_inches='tight')
print(f"ROC curve saved as 'roc_curve.png' with AUC = {roc_auc:.4f}")