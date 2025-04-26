import * as InboxSDK from '@inboxsdk/core';
import Api from './axios.config';
import { URL_SAVE_SENT_EMAIL, URL_SUMMARIZE, URL_TRACKING_STATUS } from './config';
import { ThreadStatus } from './enum';
import { getSummaryModelHtml } from '../templates/summary-modal';
import { createReplyQuickPopup } from '../components';

InboxSDK.load(1, "sdk_AIPoweredGmail_c0c468e70b").then((sdk) => {
  sdk.Compose.registerComposeViewHandler((composeView) => {
    let to = [];
    let trackingId = Date.now().toString();
    composeView.on('presending', (event) => {
      const currentBody = composeView.getHTMLContent();
      trackingId = Date.now().toString();
      const trackingPixel = `<img src="https://367b-116-105-161-175.ngrok-free.app/api/tracking/track/${trackingId}.gif" width="1" height="1" style="display:none" />`;
      composeView.setBodyHTML(currentBody + trackingPixel);

      to = composeView.getToRecipients().map((recipient) => recipient.emailAddress);
    })

    composeView.on('sent', async (event) => {
      try {
        const messsageId = await event.getMessageID();
        const threadId = await event.getThreadID();

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

  // sdk.Lists.registerThreadRowViewHandler((threadRowView) => {
  //   if (threadRowView.getThreadID().startsWith('sent')) {
  //     const emailId = threadRowView.getThreadID();
  //     const userId = 'user456';

  //     threadRowView.addButton({
  //       tittle: 'Check Tracking',
  //       iconUrl: 'hhttps://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-eye-256.png',
  //       onclick: async (event) => {
  //         const response = await fetch(`http://localhost:3001/api/tracking/sent/${emailId}/status?userId=${userId}`);
  //         const data = await response.json();
  //         const status = data.isRead ? 'Read' : 'Unread';

  //         sdk.Widgets.showModalView({
  //           title: 'Tracking Status',
  //           el: document.createElement('div'),
  //           showCloseButton: true,
  //         }).el.innerHTML = `<p>Email Status: ${status}</p>`;
  //       }
  //     })
  //   }
  // })

  sdk.Toolbars.registerThreadButton({
    title: 'Summarize',
    iconUrl: 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-eye-256.png',
    onClick: async (event) => {
      try {
        if (event.position != "THREAD") return;
        const threadView = event.selectedThreadViews[0];
        const threadId = await threadView.getThreadIDAsync();
        const messageView = threadView.getMessageViews();
        const messageId = await messageView[messageView.length - 1].getMessageIDAsync();

        const response = await Api.post(URL_SUMMARIZE, { threadId: threadId, messageId: messageId })
        const data = response.data;

        const templateHtml = getSummaryModelHtml({
          subject: data.subject,
          summary: data.summary,
        });

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = templateHtml;
        const modal = tempDiv.firstChild;

        const modalView = sdk.Widgets.showModalView({
          title: 'Email Summary',
          el: modal,
          showCloseButton: true,
        });

        setTimeout(() => {
          const closeBtn = document.getElementById('close-summary-modal');
          if (closeBtn) closeBtn.onclick = () => modalView.close();
        }, 300);

      } catch (error) {
        sdk.Widgets.showModalView({
          title: 'Error',
          el: (() => {
            const errDiv = document.createElement('div');
            errDiv.className = 'p-4 text-red-600';
            errDiv.innerText = 'Failed to summarize email!';
            return errDiv;
          })(),
          showCloseButton: true,
        })
      }
    }
  })

  sdk.Conversations.registerMessageViewHandler(async (messageView) => {
    const threadView = messageView.getThreadView();
    const threadId = await threadView.getThreadIDAsync();
    const messageId = await messageView.getMessageIDAsync();

    const labels = messageView.getMessageLabels ? await messageView.getMessageLabels() : [];
    const isSent = labels.includes('SENT');

    messageView.addToolbarButton({
      section: 'MORE',
      title: 'Summarize',
      iconUrl: 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-eye-256.png',
      onClick: async (event) => {
        try {
          const response = await Api.post(URL_SUMMARIZE, { threadId: threadId, messageId: messageId })
          const data = response.data;

          const templateHtml = getSummaryModelHtml({
            subject: data.subject,
            summary: data.summary,
          });

          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = templateHtml;
          const modal = tempDiv.firstChild;

          const modalView = sdk.Widgets.showModalView({
            title: 'Email Summary',
            el: modal,
            showCloseButton: true,
          });

          setTimeout(() => {
            const closeBtn = document.getElementById('close-summary-modal');
            if (closeBtn) closeBtn.onclick = () => modalView.close();
          }, 300);

        } catch (error) {
          sdk.Widgets.showModalView({
            title: 'Error',
            el: (() => {
              const errDiv = document.createElement('div');
              errDiv.className = 'p-4 text-red-600';
              errDiv.innerText = 'Failed to summarize email!';
              return errDiv;
            })(),
            showCloseButton: true,
          })
        }
      }
    })

    // messageView.addToolbarButton({
    //   section: 'MORE',
    //   title: 'Check Tracking',
    //   iconUrl: 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-eye-256.png',
    //   onClick: async (event) => {
    //     const response = await fetch(`http://localhost:3001/api/tracking/sent/${threadId}/status?userId=${userId}`);
    //     const data = await response.json();
    //     const status = data.isRead ? 'Read' : 'Unread';
    //     console.log("🚀 ~ onClick: ~ status:", status)

    //     sdk.Widgets.showModalView({
    //       title: 'Tracking Status',
    //       el: document.createElement('div'),
    //       showCloseButton: true,
    //     }).el.innerHTML = `<p>Email Status: ${status}</p>`;
    //   }
    // })
  })

  sdk.Lists.registerThreadRowViewHandler(async (threadRowView) => {
    const routeView = sdk.Router.getCurrentRouteView();
    if (!routeView) return;
    const routeType = routeView.getRouteID();
    if (routeType !== sdk.Router.NativeListRouteIDs.SENT) return;

    const messageId = await threadRowView.getThreadIDAsync();
    let statusTest = ThreadStatus.NOT_TRACKED;
    let textColor = "#a272f9";
    let backgroundColor = "white";

    try {
      const response = await Api.getNotAuth(`${URL_TRACKING_STATUS}/${messageId}`);
      const data = response.data;
      const readeds = [...data.readeds];

      if (readeds.length > 0) {
        statusTest = ThreadStatus.OPENS + ": " + readeds.length;
        textColor = "white";
        backgroundColor = "#a272f9";
      } else {
        statusTest = ThreadStatus.UNOPENED;
        textColor = "#a272f9";
        backgroundColor = "white";
      }
    } catch (error) {
      console.error("Error checking tracking status:", error);
    } finally {
      threadRowView.addLabel({
        title: statusTest,
        foregroundColor: textColor,
        backgroundColor: backgroundColor,
      })
    }
  })

  sdk.Compose.registerComposeViewHandler(async (composeView) => {
    function expandQuotedContentInCompose() {
      const composeEl = composeView.getElement();
      if (composeEl) {
        const showMoreBtns = composeEl.querySelectorAll('.ajT');
        showMoreBtns.forEach(btn => {
          if (btn.offsetParent !== null) btn.click();
        })
      }
    }

    setTimeout(expandQuotedContentInCompose, 300);

    const draftId = await composeView.getCurrentDraftID();
    const threadId = composeView.getThreadID();
    const button = composeView.addButton({
      title: 'Reply Quickly',
      hasDropdown: true,
      onClick: async ({ dropdown }) => {
        const content = composeView.getTextContent();
        createReplyQuickPopup({ el: dropdown.el, inboxContent: content, threadId: threadId });
      }
    })
  })

});
