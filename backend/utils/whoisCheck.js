const whois = require("whois-json");

async function getDomainAge(domain) {
    try {
        const data = await whois(domain);

        const creationDateRaw =
            data.creationDate ||
            data.created ||
            data.registered ||
            data["Creation Date"];

        if (!creationDateRaw) {
            return {
                creationDate: null,
                ageInDays: null,
                isNewDomain: true,
                warning: "Domain creation date hidden or unavailable"
            };
        }

        const creationDate = new Date(creationDateRaw);
        const today = new Date();

        const ageInDays = Math.floor(
            (today - creationDate) / (1000 * 60 * 60 * 24)
        );

        return {
            creationDate: creationDate.toDateString(),
            ageInDays,
            isNewDomain: ageInDays < 180
        };

    } catch {
        return { error: "WHOIS lookup failed" };
    }
}

module.exports = getDomainAge;
