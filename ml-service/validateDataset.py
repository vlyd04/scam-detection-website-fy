import pandas as pd
import sys

DATASET_PATH = "../backend/data/scam_dataset.csv"

# Expected features (MUST match training & backend)
EXPECTED_COLUMNS = [
    "url_length",
    "digit_count",
    "special_char_count",
    "has_ip",
    "subdomain_count",
    "has_https",
    "suspicious_tld",
    "domain_age_days",
    "keyword_density",
    "has_password_input",
    "url_entropy",
    "brand_misuse",
    "path_depth",
    "redirect_count",
    "label"
]

def fail(msg):
    print(f"❌ VALIDATION FAILED: {msg}")
    sys.exit(1)

def main():
    print("🔍 Dataset validation started")

    # ---------- Load ----------
    try:
        df = pd.read_csv(DATASET_PATH)
    except Exception as e:
        fail(f"Cannot load dataset: {e}")

    print("✅ Dataset loaded")

    # ---------- Columns ----------
    missing_cols = set(EXPECTED_COLUMNS) - set(df.columns)
    extra_cols = set(df.columns) - set(EXPECTED_COLUMNS)

    if missing_cols:
        fail(f"Missing columns: {missing_cols}")

    if extra_cols:
        print(f"⚠️ Extra columns detected (ignored): {extra_cols}")

    print("✅ All required columns present")

    # ---------- Empty / NaN ----------
    if df.isnull().any().any():
        null_counts = df.isnull().sum()
        fail(f"NaN values found:\n{null_counts}")

    print("✅ No missing values")

    # ---------- Label check ----------
    if not set(df["label"].unique()).issubset({0, 1}):
        fail("Invalid labels found (only 0 and 1 allowed)")

    scam_count = (df["label"] == 1).sum()
    legit_count = (df["label"] == 0).sum()

    print(f"📊 Scam samples : {scam_count}")
    print(f"📊 Legit samples: {legit_count}")

    imbalance_ratio = min(scam_count, legit_count) / max(scam_count, legit_count)
    if imbalance_ratio < 0.6:
        print("⚠️ WARNING: Dataset imbalance detected")

    # ---------- Range sanity checks ----------
    if (df["url_length"] <= 0).any():
        fail("Invalid url_length detected")

    if (df["domain_age_days"] < 0).any():
        print("⚠️ domain_age_days contains negative values (handled in training)")

    binary_cols = [
        "has_ip", "has_https", "suspicious_tld",
        "has_password_input", "brand_misuse"
    ]

    for col in binary_cols:
        if not set(df[col].unique()).issubset({0, 1}):
            fail(f"Non-binary values found in {col}")

    print("✅ Feature ranges look valid")

    # ---------- Summary ----------
    print("\n🎉 DATASET VALIDATION PASSED")
    print(f"Rows   : {len(df)}")
    print(f"Columns: {len(df.columns)}")

if __name__ == "__main__":
    main()