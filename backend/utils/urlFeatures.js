const { URL } = require("url");

function extractUrlFeatures(rawUrl) {
    const url = new URL(rawUrl);

    const hostname = url.hostname;

    return {
        url_length: rawUrl.length,
        digit_count: (rawUrl.match(/\d/g) || []).length,
        special_char_count: (rawUrl.match(/[^a-zA-Z0-9]/g) || []).length,
        has_ip: /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ? 1 : 0,
        subdomain_count: hostname.split(".").length - 2,
        has_https: url.protocol === "https:" ? 1 : 0,
        suspicious_tld: ["xyz", "tk", "top"].includes(hostname.split(".").pop()) ? 1 : 0
    };
}

module.exports = { extractUrlFeatures };
