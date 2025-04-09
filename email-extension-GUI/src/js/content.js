import * as InboxSDK from '@inboxsdk/core';
import axios from 'axios';
import Api from './axios.config';
import { URL_SAVE_SENT_EMAIL } from './config';

InboxSDK.load(2, "sdk_AIPoweredGmail_c0c468e70b").then((sdk) => {
  sdk.Compose.registerComposeViewHandler((composeView) => {
    let to = [];
    let trackingId = Date.now().toString();
    composeView.on('presending', (event) => {
      const currentBody = composeView.getHTMLContent();
      trackingId = Date.now().toString();
      const trackingPixel = `<img src="http://localhost:3001/api/tracking/track/${trackingId}.gif" width="1" height="1" style="display:none" />`;
      composeView.setBodyHTML(currentBody + trackingPixel);

      to = composeView.getToRecipients().map((recipient) => recipient.emailAddress);
    })

    composeView.on('sent', async (event) => {
      try {
        const messsageId = await composeView.getDraftID();
        const threadId = composeView.getThreadID();

        const response = await Api.postApiNonAuth(URL_SAVE_SENT_EMAIL, {
          messageId: messsageId,
          threadId: threadId,
          trackingId: trackingId,
          receiverAddress: to,
        })
      }
      catch (error) {
        console.log("🚀 ~ error:", error)
      }
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
    const messageId = await messageView.getMessageIDAsync();

    const labels = messageView.getMessageLabels ? await messageView.getMessageLabels() : [];
    const isSent = labels.includes('SENT');
    const userId = 'user456';

    messageView.addToolbarButton({
      section: 'MORE',
      title: 'Collect Email Data',
      iconUrl: 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-eye-256.png',
      onClick: async (event) => {
        const response = await axios.post('http://localhost:3001/api/summarize', {
          threadId: threadId,
          messageId: messageId,
        })
        console.log("🚀 ~ onClick: ~ response:", response)
      }
    })

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
