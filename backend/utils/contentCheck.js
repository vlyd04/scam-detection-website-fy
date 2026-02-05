const axios = require("axios");
const cheerio = require("cheerio");

const scamKeywords = [
    "free money",
    "earn instantly",
    "verify your account",
    "limited time",
    "act now",
    "congratulations",
    "click here",
    "urgent",
    "winner",
    "claim now"
];

async function analyzeWebsiteContent(url) {
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            maxRedirects: 5,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120"
            },
            validateStatus: () => true
        });

        if (response.status >= 400) {
            return {
                error: "Website blocked automated access",
                blocked: true
            };
        }

        const html = response.data;
        const $ = cheerio.load(html);
        const text = $("body").text().toLowerCase();

        const foundKeywords = scamKeywords.filter(k =>
            text.includes(k)
        );

        return {
            keywordMatches: foundKeywords,
            keywordCount: foundKeywords.length,
            contentFetched: true
        };

    } catch (err) {
        return {
            error: "Website not reachable or blocked",
            blocked: true
        };
    }
}

module.exports = analyzeWebsiteContent;
