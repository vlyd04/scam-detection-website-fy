// import { useState } from "react";

// function App() {
//   const [url, setUrl] = useState("");
//   const [analysis, setUrlAnalysis]=useState(null);
//   const [error, setError]=useState("");
//   const [domainAge, setDomainAge]=useState(null);
//   const [contentAnalysis, setContentAnalysis] = useState(null);
//   const [scamResult, setScamResult] = useState(null);



//   const analyzeUrl = async () => {
//   setError("");
//   setUrlAnalysis(null);
//   setDomainAge(null);
  

//   try {
//     const response = await fetch("http://localhost:3000/analyze", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ url })
//     });

//     const data = await response.json();

//     if (data.error) {
//       setError(data.error);
//       return;
//     }

//     setUrlAnalysis(data.urlAnalysis);
//     setDomainAge(data.domainAge);
//     setContentAnalysis(data.contentAnalysis);
//     setScamResult(data.scamResult);



//   } catch {
//     setError("Backend server not reachable");
//   }
// };

//   return (
//     <div style={{ padding: "40px", fontFamily: "Arial" }}>
//       <h1>Scam Website Detector</h1>

//       <input
//         type="text"
//         placeholder="Enter website URL"
//         value={url}
//         onChange={(e) => setUrl(e.target.value)}
//         style={{ width: "400px", padding: "8px" }}
//       />

//       <br /><br />

//       <button onClick={analyzeUrl} style={{ padding: "8px 20px" }}>
//         Analyze
//       </button>


//       {error && <p style={{ marginTop: "20px" }}>{error}</p>}
//       {analysis &&(
//         <div style={{marginTop:"20px"}}>
//           <h3>URL Analysis Result</h3>
//           <ul>
//             <li>URL Length: {analysis.length}</li>
//             <li>Uses HTTPS: {analysis.hasHttps ? "Yes" : "No"}</li>
//             <li>IP Address Used: {analysis.hasIp?"Yes":"No"}</li>
//             <li>Hyphen Count:{analysis.hyphenCount}</li>
//             <li>Suspicious TLD:{analysis.suspiciousTld ? "Yes":"No"}</li>
//           </ul>
//         </div>
//       )}
//       {domainAge && (
//   <div style={{ marginTop: "20px" }}>
//     <h3>Domain Age (WHOIS)</h3>
//     {domainAge.error ? (
//       <p>{domainAge.error}</p>
//     ) : (
//       <ul>
//         <li>Creation Date: {domainAge.creationDate}</li>
//         <li>Domain Age (days): {domainAge.ageInDays}</li>
//         <li>
//           New Domain:{" "}
//           {domainAge.isNewDomain ? "Yes (Suspicious)" : "No (Trusted)"}
//           {domainAge.warning && (
//   <p style={{ color: "orange" }}>{domainAge.warning}</p>
// )}
// {contentAnalysis && (
//   <div style={{ marginTop: "20px" }}>
//     <h3>Website Content Analysis</h3>

//     {contentAnalysis.error ? (
//       <p>{contentAnalysis.error}</p>
//     ) : (
//       <ul>
//         <li>Scam Keywords Found: {contentAnalysis.keywordCount}</li>
//         <li>
//           Password Field Present:{" "}
//           {contentAnalysis.hasPasswordInput ? "Yes (Risky)" : "No"}
//         </li>
//         <li>
//           Payment-related Words:{" "}
//           {contentAnalysis.hasPaymentWords ? "Yes (Risky)" : "No"}

//         </li>
//         <li>{contentAnalysis?.blocked && (
//   <p style={{ color: "orange" }}>
//     ⚠️ Website blocked automated inspection (suspicious)
//   </p>
// )}
// </li>
//       </ul>
//     )}
//   </div>
// )}


//         </li>
//       </ul>
//     )}
//   </div>
// )}

// {scamResult && (
//   <div style={{ marginTop: "30px", padding: "15px", border: "1px solid #ccc" }}>
//     <h2>Final Scam Assessment</h2>
//     <p><strong>Scam Score:</strong> {scamResult.score} / 100</p>
//     <p><strong>Verdict:</strong> {scamResult.verdict}</p>

//     <h4>Reasons:</h4>
//     <ul>
//       {scamResult.reasons.map((reason, index) => (
//         <li key={index}>{reason}</li>
//       ))}
//     </ul>
//   </div>
// )}

      
//     </div>
//   );
// }

// export default App;


import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const analyzeUrl = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Analysis failed");
        setLoading(false);
        return;
      }

      setResult(data);
      setLoading(false);

    } catch (err) {
      setError("Backend server not reachable");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Scam Website Detector</h1>

      <input
        type="text"
        placeholder="Enter website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "400px", padding: "8px" }}
      />

      <br /><br />

      <button onClick={analyzeUrl} style={{ padding: "8px 20px" }}>
        Analyze
      </button>

      {loading && <p>Analyzing website…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "30px", padding: "15px", border: "1px solid #ccc" }}>
          <h2>Scam Analysis Result</h2>

          <p>
            <strong>Verdict:</strong>{" "}
            <span
              style={{
                color:
                  result.verdict === "Likely Scam"
                    ? "red"
                    : result.verdict === "Suspicious"
                    ? "orange"
                    : "green"
              }}
            >
              {result.verdict}
            </span>
          </p>

          <p><strong>Risk Score:</strong> {result.riskScore} / 100</p>
          <p>
            <strong>AI Confidence:</strong>{" "}
            {(result.ml_probability * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
