from predict import predict_with_explanation

sample_features = {
    "url_length": 98,
    "digit_count": 4,
    "special_char_count": 6,
    "has_ip": 0,
    "subdomain_count": 3,
    "has_https": 1,
    "suspicious_tld": 0,
    "domain_age_days": 0,
    "keyword_density": 0.1,
    "has_password_input": 1,
    "url_entropy": 4.8,
    "brand_misuse": 1,
    "path_depth": 5,
    "redirect_count": 0
}

result = predict_with_explanation(sample_features)

print("\nPrediction result:\n")
print(result)