import pandas as pd

df = pd.read_csv("../backend/data/scam_dataset.csv")

print("Total rows:", len(df))
print("Columns:", df.columns.tolist())

print("\nMissing values per column:")
print(df.isnull().sum())

print("\nLabel distribution:")
print(df["label"].value_counts())

print("\nSample rows:")
print(df.head())
