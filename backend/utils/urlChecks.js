function analyzeUrl(urlString) {
    const result = {
        length: urlString.length,
        hasHttps: false,
        hasIp: false,
        hypenCount: 0,
        suspiciousTld: false
    };
    try {
        const url = new URL(urlString);
        result.hasHttps = url.protocol === "https:";
        const ipRegex = /^\d+\.\d+\.\d+\.\d+$/;
        result.hasIp = ipRegex.test(url.hostname);
        result.hyphenCount = (url.hostname.match(/-/g) || []).length;
        const suspiciousTlds = ["xyz", "tk", "top", "club"];
        const tld = url.hostname.split(".").pop();
        result.suspiciousTld = suspiciousTlds.includes(tld);
    } catch (err) {
        return { error: "Invalid url format" };
    }
    return result;
}

module.exports = analyzeUrl;
