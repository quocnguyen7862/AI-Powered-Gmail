import Api from "./axios.config";
import { serverConfig, URL_GMAIL_AUTH } from "./config";

document.addEventListener('DOMContentLoaded', () => {
    const authButton = document.getElementById('authenticate');
    const authSection = document.getElementById('auth-section');

    // chrome.storage.local.get(['gmailTokens'], (result) => {
    //     if (result.gmailTokens) {
    //         authSection.classList.add('hidden');
    //         trackingSection.classList.remove('hidden');
    //         loadCurrentEmail();
    //     }
    // });

    // authButton.addEventListener('click', () => {
    //     chrome.runtime.sendMessage({ action: 'authenticate' }, (response) => {
    //         if (response.authUrl) {
    //             chrome.tabs.create({ url: response.authUrl });
    //         }
    //     })
    // });


    authButton.addEventListener("click", async () => {
        try {
            // Construct the URL
            const response = await Api.getNotAuth(URL_GMAIL_AUTH);

            // Open the URL in a new tab
            chrome.tabs.create({ url: response.data }); // For Chrome extensions
            // OR, if not using Chrome extensions:
            // window.open(response.data, '_blank');
        } catch (error) {
            console.error("Error during redirection:", error);
        }
    });
});