import { useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const apiBaseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

  const analyzeUrl = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    try {
      if (!apiBaseUrl) {
        throw new Error("VITE_API_URL is not set");
      }

      const response = await fetch(`${apiBaseUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        if (typeof data === "string") {
          throw new Error(`Backend error (${response.status})`);
        }
        throw new Error(data.error || `Analysis failed (${response.status})`);
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      analyzeUrl();
    }
  };

  const getVerdictClass = (verdict) => {
    if (verdict === "Likely Scam") return "verdict-danger";
    if (verdict === "Suspicious") return "verdict-warning";
    return "verdict-safe";
  };

  const getRiskClass = (score) => {
    if (score >= 70) return "risk-high";
    if (score >= 40) return "risk-medium";
    return "risk-low";
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        {/* Header Section */}
        <header className="header">
          <div className="icon-shield">🛡️</div>
          <h1 className="title">Scam Website Detector</h1>
          <p className="subtitle">
            Protect yourself from phishing and scam websites with AI-powered analysis
          </p>
        </header>

        {/* Input Section */}
        <div className="input-section">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Enter website URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="url-input"
              disabled={loading}
            />
            <button 
              onClick={analyzeUrl} 
              className="analyze-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="button-icon">🔍</span>
                  Analyze URL
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message fade-in">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="results-container fade-in">
            {/* Verdict Card */}
            <div className={`verdict-card ${getVerdictClass(result.verdict)}`}>
              <div className="verdict-icon">
                {result.verdict === "Likely Scam" && "🚨"}
                {result.verdict === "Suspicious" && "⚠️"}
                {result.verdict === "Likely Safe" && "✅"}
              </div>
              <h2 className="verdict-title">Analysis Complete</h2>
              <div className="verdict-label">{result.verdict}</div>
            </div>

            {/* Risk Score Progress Bar */}
            <div className="score-section">
              <div className="score-header">
                <span className="score-label">Risk Score</span>
                <span className={`score-value ${getRiskClass(result.riskScore)}`}>
                  {result.riskScore}/100
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${getRiskClass(result.riskScore)}`}
                  style={{ width: `${result.riskScore}%` }}
                >
                  <span className="progress-text">{result.riskScore}%</span>
                </div>
              </div>
            </div>

            {/* ML Confidence */}
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">🤖</span>
                <span className="metric-title">ML Confidence</span>
              </div>
              <div className="metric-value">
                {(result.ml_probability * 100).toFixed(2)}%
              </div>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${(result.ml_probability * 100).toFixed(0)}%` }}
                ></div>
              </div>
            </div>

            {/* Analysis Method */}
            {result.analysis && result.analysis.method && (
              <div className="info-card">
                <div className="info-header">
                  <span className="info-icon">⚙️</span>
                  Analysis Method
                </div>
                <div className="info-content">
                  <span className="method-badge">{result.analysis.method}</span>
                  {result.analysis.heuristic_adjustment !== 0 && (
                    <span className="adjustment-text">
                      Adjusted {result.analysis.heuristic_adjustment > 0 ? "+" : ""}
                      {(result.analysis.heuristic_adjustment * 100).toFixed(1)}% 
                      based on pattern detection
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Applied Rules */}
            {result.analysis?.applied_rules?.length > 0 && (
              <div className="rules-card">
                <div className="rules-header">
                  <span className="rules-icon">📋</span>
                  Detection Patterns Identified
                </div>
                <ul className="rules-list">
                  {result.analysis.applied_rules.map((rule, idx) => (
                    <li key={idx} className="rule-item">
                      <span className="rule-bullet">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Explanation Section */}
            {result.explanation?.top_features?.length > 0 && (
              <div className="explanation-card">
                <div className="explanation-header">
                  <span className="explanation-icon">💡</span>
                  Why This Result?
                </div>
                <div className="features-grid">
                  {result.explanation.top_features.map((item, index) => (
                    <div 
                      key={index} 
                      className={`feature-item ${
                        item.direction === "increase_risk" 
                          ? "feature-risk" 
                          : "feature-safe"
                      }`}
                    >
                      <span className="feature-indicator">
                        {item.direction === "increase_risk" ? "↑" : "↓"}
                      </span>
                      <div className="feature-content">
                        <strong className="feature-name">{item.feature}</strong>
                        <span className="feature-impact">
                          {item.direction === "increase_risk"
                            ? "Increased risk"
                            : "Reduced risk"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="footer">
          <p>🔒 Powered by Machine Learning & Heuristic Analysis</p>
        </footer>
      </div>
    </div>
  );
}

export default App;