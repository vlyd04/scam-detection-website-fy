const resultDiv = document.getElementById("result");
const scanBtn = document.getElementById("scanBtn");

scanBtn.addEventListener("click", () => {
    resultDiv.innerText = "Reading URL...";

    chrome.runtime.sendMessage(
        { action: "GET_ACTIVE_TAB" },
        async (response) => {
            if (response?.error) {
                resultDiv.innerText = response.error;
                return;
            }

            const url = response.url;
            resultDiv.innerText = "Scanning...";

            try {
                const res = await fetch("http://localhost:5000/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url })
                });

                const data = await res.json();

                resultDiv.innerText =
                    `Risk: ${data.risk}%\n${data.verdict || ""}`;
            } catch (err) {
                resultDiv.innerText = "Backend not reachable";
            }
        }
    );
});
