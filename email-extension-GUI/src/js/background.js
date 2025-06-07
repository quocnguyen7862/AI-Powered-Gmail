chrome.runtime.onMessage.addListener((data) => {
    if (data.type === 'email_read') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: "icons8-owl-48.png",
            title: `Email from ${data.message?.email} has been opened`,
            message: `"${data.message?.subject}"`
        })
    }
})