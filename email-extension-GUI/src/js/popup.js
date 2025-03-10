document.addEventListener('DOMContentLoaded', () => {
    const authButton = document.getElementById('authenticate');
    const checkButton = document.getElementById('check-status');
    const markReadButton = document.getElementById('mark-read');
    const emailIdSpan = document.getElementById('email-id');
    const statusSpan = document.getElementById('email-status');
    const checkmarkSpan = document.getElementById('checkmark');
    const message = document.getElementById('message');
    const authSection = document.getElementById('auth-section');
    const trackingSection = document.getElementById('tracking-section');

    const backendUrl = 'http://localhost:3001';
    const userId = '';

    chrome.storage.local.get(['gmailTokens'], (result) => {
        if (result.gmailTokens) {
            authSection.classList.add('hidden');
            trackingSection.classList.remove('hidden');
            loadCurrentEmail();
        }
    });

    authButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'authenticate' }, (response) => {
            if (response.authUrl) {
                chrome.tabs.create({ url: response.authUrl });
            }
        })
    });

    checkButton.addEventListener('clink', () => {
        const emailId = emailIdSpan.textContent;
        checkEmailStatus(emailId);
    });

    checkButton.addEventListener('click', () => {
        const emailId = emailIdSpan.textContent;
        checkEmailStatus(emailId, true);
    })

    markReadButton.addEventListener('click', () => {
        const emailId = emailIdSpan.textContent;
        updateEmailStatus(emailId, true);
    });

    // Hàm gọi API kiểm tra trạng thái
    async function checkEmailStatus(emailId, syncWithGmail = false) {
        try {
            statusSpan.textContent = 'Checking...';
            statusSpan.className = 'font-bold text-red-600';
            checkmarkSpan.textContent = ''; // Xóa checkmark khi đang kiểm tra
            const response = await fetch(
                `${backendUrl}/emails/${emailId}/status?userId=${userId}&sync=${syncWithGmail}`
            );
            const data = await response.json();
            statusSpan.textContent = data.isRead ? 'Read' : 'Unread';
            statusSpan.className = data.isRead ? 'font-bold text-green-600' : 'font-bold text-red-600';
            updateCheckmark(data.isRead); // Cập nhật checkmark
            message.textContent = '';
        } catch (error) {
            message.textContent = 'Error checking status';
            console.error(error);
        }
    }

    // Hàm gọi API cập nhật trạng thái
    async function updateEmailStatus(emailId, isRead) {
        try {
            const response = await fetch(`${backendUrl}/emails/${emailId}/status?userId=${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead }),
            });
            const data = await response.json();
            message.textContent = data.message;
            checkEmailStatus(emailId); // Cập nhật giao diện sau khi thay đổi
        } catch (error) {
            message.textContent = 'Error updating status';
            console.error(error);
        }
    }

    // Hàm cập nhật checkmark giống Mailtrack
    function updateCheckmark(isRead) {
        if (isRead) {
            checkmarkSpan.textContent = '✓✓'; // Hai dấu check cho đã đọc
            checkmarkSpan.className = 'ml-1 align-middle text-green-600';
        } else {
            checkmarkSpan.textContent = '✓'; // Một dấu check cho chưa đọc
            checkmarkSpan.className = 'ml-1 align-middle text-gray-600';
        }
    }
});