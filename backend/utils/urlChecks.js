function analyzeUrl(urlString) {
    try {
        const url = new URL(urlString);
        const hostname = url.hostname;

        return {
            length: urlString.length,
            hasHttps: url.protocol === "https:",
            hasIP: /^\d+\.\d+\.\d+\.\d+$/.test(hostname),
            hyphenCount: (hostname.match(/-/g) || []).length,
            suspiciousTLD: ["xyz", "tk", "top", "club"].includes(hostname.split(".").pop()),
            digitCount: (urlString.match(/\d/g) || []).length,
            specialCharCount: (urlString.match(/[^a-zA-Z0-9]/g) || []).length,
            subdomainCount: hostname.split(".").length - 2
        };
    } catch (err) {
        return { error: "Invalid url format" };
    }
}

module.exports = analyzeUrl;
