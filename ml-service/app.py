from fastapi import FastAPI
from pydantic import BaseModel
from predict import predict_with_explanation

app = FastAPI(title="Scam Detection ML Service")

# ---- Input schema ----
class URLFeatures(BaseModel):
    url_length: int
    digit_count: int
    special_char_count: int
    has_ip: int
    subdomain_count: int
    has_https: int
    suspicious_tld: int
    domain_age_days: int
    keyword_density: float
    has_password_input: int
    url_entropy: float
    brand_misuse: int
    path_depth: int
    redirect_count: int


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/predict")
def predict(features: URLFeatures):
    result = predict_with_explanation(features.dict())
    return result