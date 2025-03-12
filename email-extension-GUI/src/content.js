import * as InboxSDK from '@inboxsdk/core';

InboxSDK.load(2, "sdk_AIPoweredGmail_c0c468e70b").then((sdk) => {
  sdk.Compose.registerComposeViewHandler((composeView) => {
    composeView.on('presending', (event) => {
      const currentBody = composeView.getHTMLContent();
      const trackingId = Date.now().toString();
      const trackingPixel = `<img src="http://localhost:3001/api/tracking/track/${trackingId}" width="1" height="1" style="display:none" />`;
      composeView.setBodyHTML(currentBody + trackingPixel);

      const to = composeView.getToRecipients().map(r => r.emailAddress).join(',');
      const subject = composeView.getSubject();
      fetch('http://localhost:3001/api/tracking/save-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user456',
          emailId: trackingId,
          to,
          subject,
          trackingId,
        })
      })
    })

    composeView.on('sent', function (event) {
      const threadId = composeView.getThreadID();
      const trackingId = Date.now().toString();

      fetch('http://localhost:3001/api/tracking/save-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user456',
          emailId: threadId,
          trackingId,
        }),
      });
    });
  })

  sdk.Lists.registerThreadRowViewHandler((threadRowView) => {
    if (threadRowView.getThreadID().startsWith('sent')) {
      const emailId = threadRowView.getThreadID();
      const userId = 'user456';

      threadRowView.addButton({
        tittle: 'Check Tracking',
        iconUrl: 'hhttps://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-eye-256.png',
        onclick: async (event) => {
          const response = await fetch(`http://localhost:3001/api/tracking/sent/${emailId}/status?userId=${userId}`);
          const data = await response.json();
          const status = data.isRead ? 'Read' : 'Unread';

          sdk.Widgets.showModalView({
            title: 'Tracking Status',
            el: document.createElement('div'),
            showCloseButton: true,
          }).el.innerHTML = `<p>Email Status: ${status}</p>`;
        }
      })
    }
  })

  sdk.Conversations.registerMessageViewHandler(async (messageView) => {
    const threadView = messageView.getThreadView();
    const threadId = await threadView.getThreadIDAsync();

    const labels = messageView.getMessageLabels ? await messageView.getMessageLabels() : [];
    const isSent = labels.includes('SENT');
    const userId = 'user456';

    messageView.addToolbarButton({
      section: 'MORE',
      title: 'Check Tracking',
      iconUrl: 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-eye-256.png',
      onClick: async (event) => {
        const response = await fetch(`http://localhost:3001/api/tracking/sent/${threadId}/status?userId=${userId}`);
        const data = await response.json();
        const status = data.isRead ? 'Read' : 'Unread';
        console.log("🚀 ~ onClick: ~ status:", status)

        sdk.Widgets.showModalView({
          title: 'Tracking Status',
          el: document.createElement('div'),
          showCloseButton: true,
        }).el.innerHTML = `<p>Email Status: ${status}</p>`;
      }
    })
  })
});
