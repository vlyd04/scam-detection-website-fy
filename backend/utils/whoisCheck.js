const whois = require("whois-json");

async function getDomainAge(domain) {
    try {
        console.log(`  [WHOIS] Querying: ${domain}`);
        const data = await whois(domain, { follow: 3, timeout: 10000 });
        console.log(`  [WHOIS] Data received for ${domain}`);

        // Try multiple possible field names for creation date
        const creationDateRaw =
            data.creationDate ||
            data.created ||
            data.registered ||
            data["Creation Date"] ||
            data.createdDate ||
            data["Created Date"] ||
            data.registrationDate ||
            data["Registration Date"] ||
            data["Registered On"];

        if (!creationDateRaw) {
            console.log(`  [WHOIS] No creation date found for ${domain}`);
            console.log(`  [WHOIS] Available fields:`, Object.keys(data).slice(0, 10));
            return {
                creationDate: null,
                ageDays: 0,
                isNewDomain: true,
                warning: "Domain creation date hidden or unavailable"
            };
        }

        const creationDate = new Date(creationDateRaw);

        // Validate the date
        if (isNaN(creationDate.getTime())) {
            console.log(`  [WHOIS] Invalid date format: ${creationDateRaw}`);
            return {
                creationDate: null,
                ageDays: 0,
                isNewDomain: true,
                warning: "Could not parse creation date"
            };
        }

        const today = new Date();
        const ageInDays = Math.floor(
            (today - creationDate) / (1000 * 60 * 60 * 24)
        );

        console.log(`  [WHOIS] ${domain} created: ${creationDate.toDateString()} (${ageInDays} days old)`);

        return {
            creationDate: creationDate.toDateString(),
            ageDays: ageInDays,
            isNewDomain: ageInDays < 180
        };

    } catch (err) {
        console.error(`  [WHOIS] Error for ${domain}:`, err.message);
        return { error: "WHOIS lookup failed", ageDays: 0 };
    }
}

module.exports = getDomainAge;
