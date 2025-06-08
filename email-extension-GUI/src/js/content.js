import * as InboxSDK from '@inboxsdk/core';
import Api from './axios.config';
import { serverConfig, URL_AUTH_CHECK, URL_CHAT_HISTORY, URL_LABEL, URL_SAVE_SENT_EMAIL, URL_SEARCH, URL_SUMMARIZE_BY_DRAFT, URL_SUMMARIZE_BY_MESSAGE, URL_TRACKING_READED, URL_TRACKING_STATUS, URL_TRACKING_TRACK } from './config';
import { ThreadStatus } from './enum';
import { getSummaryModelHtml } from '../templates/summary-modal';
import { createAppMenuPopup, createChatbotPanel, createReplyQuickPopup, createSelectLabels, createSummaryButton, createSummaryPopup, createTrackingPanel, destroyComponent } from '../components';
import { Bus } from 'baconjs'
import { connectToSocket } from './connectToSocket';

InboxSDK.load(2, "sdk_AIPoweredGmail_c0c468e70b").then((sdk) => {
  async function checkLogin(email) {
    try {
      const response = await Api.getWithParams(URL_AUTH_CHECK, { email: email });
      if (response.status === 200) {
        return {
          isSignedIn: true,
          userId: response.data.userId,
          accessToken: response.data.jwt_accessToken,
          fullName: response.data.fullName,
          email: response.data.email
        };
      } else {
        return { isSignedIn: false, userId: undefined, accessToken: undefined, fullName: undefined };
      }
    }
    catch (error) {
      return { isSignedIn: false, userId: undefined, accessToken: undefined, fullName: undefined };
    }
  }

  async function fetchLabels(session) {
    try {
      const response = await Api.get(URL_LABEL, {}, session?.accessToken);
      return response.data
    }
    catch (error) {
      // console.error("Error fetching labels:", error);
    }
  }

  let session;
  checkLogin(sdk.User.getEmailAddress()).then((res) => {
    session = res;

    if (res.isSignedIn) {
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

      connectToSocket(session.userId)


      const navLabels = sdk.NavMenu.addNavItem({
        name: 'AI Labels',
        key: "AI_LABELS",
        routeID: "AI_LABELS",
        type: 'NAVIGATION'
      })

      fetchLabels(session).then((labels) => {
        let selectedLabel = 0;
        for (const label of labels) {
          navLabels.addNavItem({
            name: `${label.name} (${label.classifies.length})`,
            key: label.id,
            routeID: label.name,
            type: 'NAVIGATION',
            onClick: async () => {
              selectedLabel = label.id;
            },
            backgroundColor: label.color,
          })

          sdk.Router.handleCustomListRoute(label.name, async (offset, max) => {
            const response = await Api.get(URL_LABEL + `/${selectedLabel}`, {}, session?.accessToken);
            const emails = response.data?.classifies
            return {
              threads: emails.map((email) => {
                return {
                  gmailThreadId: email.messageId,
                }
              }),
              total: emails.length,
            }
          })
        }
      })

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
          // console.error("Error checking tracking status:", error);
        } finally {
          threadRowView.addLabel({
            title: statusTest,
            foregroundColor: textColor,
            backgroundColor: backgroundColor,
          })
        }
      })

      sdk.Lists.registerThreadRowViewHandler(async (threadRowView) => {
        const messsageId = await threadRowView.getThreadIDAsync();

        try {
          const response = await Api.get(`${URL_LABEL}/message/${messsageId}`, {}, session?.accessToken);
          const label = response.data;
          threadRowView.addLabel({
            title: label.name,
            backgroundColor: label.color,
            foregroundColor: 'white',
          })
        } catch (error) {
          console.error("Error fetching labels for message:", error);
        }

      })

      sdk.Compose.registerComposeViewHandler(async (composeView) => {
        const isReply = composeView.isReply();
        let threadId = null;
        let draftId = null;

        const currentBody = composeView.getHTMLContent();
        const pixel = `<img src="" width="1" height="1" style="display:none" />`;
        composeView.setBodyHTML(currentBody + pixel);

        let trackingEnabled = true;
        let enableTrackingIcon = 'https://img.icons8.com/pulsar-color/48/appointment-reminders.png'
        let disableTrackingIcon = 'https://img.icons8.com/pulsar-color/48/no-reminders.png';

        const trackingBus = new Bus();

        // Tạo button với Bacon stream
        const trackingButton = composeView.addButton(
          trackingBus
            .scan(trackingEnabled, (prev) => !prev) // Đảo trạng thái mỗi lần click
            .map((enabled) => ({
              title: enabled ? 'Disable tracking for this email' : 'Enable tracking for this email',
              iconUrl: enabled ? enableTrackingIcon : disableTrackingIcon,
              iconClass: 'm-[-4px] w-[20px] h-[20px]',
              onClick: () => {
                trackingBus.push(); // Phát sự kiện để đổi trạng thái
                trackingEnabled = !trackingEnabled; // Cập nhật biến trạng thái nếu cần dùng ở nơi khác
              }
            }))
        );

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

        let to = [];
        let trackingId = Date.now().toString();
        composeView.on('presending', (event) => {
          if (!trackingEnabled) {
            return;
          }
          const currentBody = composeView.getHTMLContent();
          trackingId = Date.now().toString();
          const trackingPixel = `<img src="${serverConfig.api}/${URL_TRACKING_TRACK}/${trackingId}.gif" width="1" height="1" style="display:none" />`;
          composeView.setBodyHTML(currentBody + trackingPixel);

          to = composeView.getToRecipients().map((recipient) => recipient.emailAddress);
        })

        composeView.on('sent', async (event) => {
          try {
            if (!trackingEnabled) {
              return;
            }
            const messsageId = await event.getMessageID();
            const threadId = await event.getThreadID();

            const response = await Api.post(URL_SAVE_SENT_EMAIL, {
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

      const chatbotPanelEl = document.createElement('div');
      chatbotPanelEl.className = 'h-full';
      let chatbotPanel = null;
      let currentThread = null;
      sdk.Global.addSidebarContentPanel(
        {
          title: 'AI Assistant',
          iconUrl: 'https://img.icons8.com/pulsar-color/48/message-bot.png',
          el: chatbotPanelEl,
        }
      ).then((panel) => {
        if (!chatbotPanel)
          chatbotPanel = panel;
        panel.close();
        panel.on('activate', () => {
          createChatbotPanel({ el: chatbotPanelEl, session: session, thread: currentThread })
        });
      })

      const trackingPanelEl = document.createElement('div');
      let trackingPanel = null;

      sdk.Conversations.registerThreadViewHandler(async (threadView) => {

        const threadId = await threadView.getThreadIDAsync();
        currentThread = {
          id: threadId,
          subject: threadView.getSubject(),
        }

        if (!!chatbotPanel && chatbotPanel.isActive()) {
          chatbotPanel.close();
          chatbotPanel.open();
        }

        try {
          const response = await Api.get(URL_TRACKING_READED + `/${threadId}`, {}, session?.accessToken);
          const trackings = response.data;
          if (trackings.length > 0) {
            trackingPanelEl.className = 'h-full';
            createTrackingPanel({ el: trackingPanelEl, trackings: trackings })
            sdk.Global.addSidebarContentPanel(
              {
                title: 'Email Tracking',
                el: trackingPanelEl,
                iconUrl: "https://img.icons8.com/pulsar-color/48/feedback.png"
              }
            ).then((panel) => {
              trackingPanel = panel;
              panel.open();
            })
          }
        } catch (error) {

        }
      })

      sdk.Router.handleAllRoutes((routeView) => {
        const routeId = routeView.getRouteID();
        if (routeId !== sdk.Router.NativeRouteIDs.THREAD) {
          currentThread = undefined;
          if (!!chatbotPanel && chatbotPanel.isActive()) {
            chatbotPanel.close();
            chatbotPanel.open();
          }

          if (trackingPanel) {
            trackingPanel.close();
            destroyComponent(trackingPanelEl);
          }
        }
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
    iconUrl: "https://img.icons8.com/pulsar-color/48/owl.png",
    iconClass: '!w-[32px] !h-[32px] p-[6px] mt-[10px] ml-[-5px] rounded-[50%] hover:bg-white hover:shadow-lg',
    onClick: async ({ dropdown }) => {
      const email = sdk.User.getEmailAddress();
      createAppMenuPopup({ el: dropdown.el, email: email, session: session });
    }
  })


});
