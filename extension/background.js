chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "GET_ACTIVE_TAB") {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            (tabs) => {
                if (tabs.length === 0) {
                    sendResponse({ error: "No active tab" });
                } else {
                    sendResponse({ url: tabs[0].url });
                }
            }
        );
        return true; // REQUIRED for async response
    }
});
