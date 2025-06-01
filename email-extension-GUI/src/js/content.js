import * as InboxSDK from '@inboxsdk/core';
import Api from './axios.config';
import { URL_AUTH_CHECK, URL_CHAT_HISTORY, URL_SAVE_SENT_EMAIL, URL_SEARCH, URL_SUMMARIZE_BY_DRAFT, URL_SUMMARIZE_BY_MESSAGE, URL_TRACKING_STATUS } from './config';
import { ThreadStatus } from './enum';
import { getSummaryModelHtml } from '../templates/summary-modal';
import { createAppMenuPopup, createChatbotPanel, createReplyQuickPopup, createSelectLabels, createSummaryButton, createSummaryPopup } from '../components';

InboxSDK.load(2, "sdk_AIPoweredGmail_c0c468e70b").then((sdk) => {
  async function checkLogin(email) {
    try {
      const response = await Api.getWithParams(URL_AUTH_CHECK, { email: email });
      if (response.status === 200) {
        return {
          isSignedIn: true,
          sessionId: response.data.sessionId,
          accessToken: response.data.jwt_accessToken,
          fullName: response.data.fullName,
          email: response.data.email
        };
      } else {
        return { isSignedIn: false, sessionId: undefined, accessToken: undefined, fullName: undefined };
      }
    }
    catch (error) {
      return { isSignedIn: false, sessionId: undefined, accessToken: undefined, fullName: undefined };
    }
  }

  let session;
  checkLogin(sdk.User.getEmailAddress()).then((res) => {
    session = res;

    if (res.isSignedIn) {
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

        composeView.on("destroy", async (event) => {
          try {
            const draftId = await composeView.getDraftID();
            await Api.delete(URL_CHAT_HISTORY + `/${draftId}`, {}, session?.accessToken);
          }
          catch (error) {
            console.log("🚀 ~ error:", error)
          }
        })
      })

      // sdk.Toolbars.registerThreadButton({
      //   title: 'AI Label',
      //   iconUrl: 'https://img.icons8.com/material-outlined/48/sparkling.png',
      //   hasDropdown: true,
      //   onClick: async (event) => {
      //     try {
      //       let threadView;
      //       if (event.position === "THREAD")
      //         threadView = event.selectedThreadViews[0];
      //       else
      //         threadView = event.selectedThreadRowViews[0];
      //       const threadId = await threadView.getThreadIDAsync();

      //       createSelectLabels({ el: event.dropdown.el, session: session })


      //     } catch (error) {
      //     }
      //   }
      // })

      sdk.Toolbars.registerThreadButton({
        title: 'Summarize email',
        iconUrl: 'https://img.icons8.com/pulsar-color/48/fine-print.png',
        hasDropdown: true,
        onClick: async (event) => {
          try {
            let threadView;
            if (event.position === "THREAD")
              threadView = event.selectedThreadViews[0];
            else
              threadView = event.selectedThreadRowViews[0];
            const threadId = await threadView.getThreadIDAsync();

            event.dropdown.el.className += " !rounded-[12px] !mt-3 min-w-[400px] -translate-x-1/2";
            createSummaryPopup({ el: event.dropdown.el, threadId: threadId, messageId: threadId, session: session });

          } catch (error) {
          }
        }
      })

      sdk.Conversations.registerMessageViewHandler(async (messageView) => {
        const threadView = messageView.getThreadView();
        const threadId = await threadView.getThreadIDAsync();
        const messageId = await messageView.getMessageIDAsync();

        const labels = messageView.getMessageLabels ? await messageView.getMessageLabels() : [];
        const isSent = labels.includes('SENT');

        const bodyElement = messageView.getBodyElement();

        if (bodyElement) {
          createSummaryButton({ el: bodyElement.insertAdjacentElement('beforebegin', document.createElement('div')), threadId: threadId, messageId: messageId, session: session });
        }
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
        const isReply = composeView.isReply();
        let threadId = null;
        let draftId = null;

        const currentBody = composeView.getHTMLContent();
        const pixel = `<img src="" width="1" height="1" style="display:none" />`;
        composeView.setBodyHTML(currentBody + pixel);

        if (isReply) {
          // expandQuotedContentInCompose();
          threadId = composeView.getThreadID();
        }
        draftId = await composeView.getDraftID();

        const button = composeView.addButton({
          title: 'Ai Generated Reply',
          iconUrl: 'https://img.icons8.com/pulsar-color/48/ai-generated-text.png',
          iconClass: 'm-[-4px] w-[20px] h-[20px]',
          hasDropdown: true,
          onClick: async ({ dropdown }) => {
            createReplyQuickPopup({ el: dropdown.el, threadId: threadId, draftId: draftId, composeView: composeView, session: session });
          }
        })

        composeView.on("discard", async (event) => {
          try {
            await Api.delete(URL_CHAT_HISTORY + `/${draftId}`, {}, session?.accessToken);
          } catch (error) {
            console.log("🚀 ~ error:", error)
          }
        })
      })

      const chatbotPanelEl = document.createElement('div');
      chatbotPanelEl.className = 'h-full';
      sdk.Global.addSidebarContentPanel(
        {
          title: 'AI Assistant',
          iconUrl: 'https://img.icons8.com/pulsar-color/48/message-bot.png',
          el: chatbotPanelEl,
        }
      ).then((panel) => {
        panel.close();
        panel.on('activate', () => {
          createChatbotPanel({ el: chatbotPanelEl, session: session })
        });
      })

      // sdk.Router.handleCustomRoute('semantic-search', (routeView) => {

      // })

      let searchQuery;

      sdk.Search.registerSearchSuggestionsProvider((query) => {
        searchQuery = query;
        return [
          {
            name: 'Search by semantics: ' + query,
            onClick: () => {
              sdk.Router.goto(`semantic-search/${query}`);
            }
          }
        ]
      })

      sdk.Router.handleCustomListRoute("semantic-search", async (offset, max) => {
        const response = await Api.post(URL_SEARCH, { message: searchQuery }, {}, session?.accessToken);
        const emails = response.data.emails || []
        return {
          threads: emails.map((email) => {
            return {
              gmailThreadId: email.threadId,
            }
          }),
          total: emails.length,
        }
      })

      // sdk.Router.handleListRoute(sdk.Router.NativeListRouteIDs.SEARCH, async (routeView) => {
      //   const params = routeView.getParams()
      //   const query = params.query;
      //   const response = await Api.post(URL_SEARCH, { message: query }, {}, session?.accessToken);
      //   const emails = response.data.emails || []
      //   const output = response.data.output
      //   routeView.addSection({
      //     title: "Search by semantics",
      //     tableRows: emails?.length > 0 && emails.map((email) => {
      //       return {
      //         title: email.subject,
      //         body: email.snippet,
      //         shortDetailText: email.date,

      //       }
      //     })
      //   })
      // })

    }

  });

  sdk.Toolbars.addToolbarButtonForApp({
    title: 'AI Powered Gmail',
    onClick: async ({ dropdown }) => {
      const email = sdk.User.getEmailAddress();
      createAppMenuPopup({ el: dropdown.el, email: email, session: session });
    }
  })


});
