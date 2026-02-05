const whois = require("whois-json");

async function getDomainAgeDays(domain) {
    try {
        const data = await whois(domain);
        if (!data.creationDate) return -1;

        const created = new Date(data.creationDate);
        const now = new Date();
        return Math.floor((now - created) / (1000 * 60 * 60 * 24));
    } catch {
        return -1;
    }
}

module.exports = { getDomainAgeDays };
