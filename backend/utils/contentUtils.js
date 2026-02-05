const axios = require("axios");

const scamWords = ["verify", "urgent", "login", "claim", "password"];

async function extractContentFeatures(url) {
    try {
        const res = await axios.get(url, { timeout: 5000 });
        const html = res.data.toLowerCase();

        const wordHits = scamWords.filter(w => html.includes(w)).length;
        const hasPasswordInput = html.includes('type="password"') ? 1 : 0;

        return {
            keyword_density: wordHits / scamWords.length,
            has_password_input: hasPasswordInput
        };
    } catch {
        return {
            keyword_density: 0,
            has_password_input: 0
        };
    }
}

module.exports = { extractContentFeatures };
