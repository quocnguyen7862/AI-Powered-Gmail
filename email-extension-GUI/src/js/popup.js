import Api from "./axios.config";
import { serverConfig, URL_GMAIL_AUTH } from "./config";

document.addEventListener('DOMContentLoaded', () => {
    const authButton = document.getElementById('authenticate');
    const authSection = document.getElementById('auth-section');
    const trackerSection = document.getElementById('tracker-section');

    // Kiểm tra trạng thái đăng nhập khi mở popup
    chrome.storage.local.get(['gmailTokens'], (result) => {
        if (result.gmailTokens) {
            authSection.classList.add('hidden');
            trackerSection.classList.remove('hidden');
        } else {
            authSection.classList.remove('hidden');
            trackerSection.classList.add('hidden');
        }
    });

    // Lắng nghe thay đổi token để realtime chuyển UI (nếu cần)
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.gmailTokens) {
            if (changes.gmailTokens.newValue) {
                authSection.classList.add('hidden');
                trackerSection.classList.remove('hidden');
            } else {
                authSection.classList.remove('hidden');
                trackerSection.classList.add('hidden');
            }
        }
    });

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