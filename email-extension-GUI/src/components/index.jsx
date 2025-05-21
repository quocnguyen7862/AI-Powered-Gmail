import React from "react";
import { createRoot } from "react-dom/client";
import ReplyQuickPopup from "./ReplyQuickPopup/ReplyQuickPopup";
import SummaryPopup from "./SummaryPopup/SummaryPopup";
import AppMenuPopup from "./AppMenuPopup/AppMenuPopup";
import ChatbotPanel from "./ChatbotPanel/ChatbotPanel";

function getOrCreateRoot(el) {
    if (!el.__reactRoot) {
        el.__reactRoot = createRoot(el);
    }
    return el.__reactRoot;
}

export function createReplyQuickPopup({ el, threadId, draftId, composeView, session }) {
    const root = getOrCreateRoot(el);
    root.render(
        <ReplyQuickPopup threadId={threadId} draftId={draftId} composeView={composeView} session={session} />
    );
}

export function createSummaryPopup({ el, threadId, messageId, session }) {
    const root = getOrCreateRoot(el);
    root.render(
        <SummaryPopup threadId={threadId} messageId={messageId} session={session} />
    );
}

export function createAppMenuPopup({ el, email, session, }) {
    const root = getOrCreateRoot(el);
    root.render(
        <AppMenuPopup email={email} session={session} />
    )
}

export function createChatbotPanel({ el, session }) {
    const root = getOrCreateRoot(el);
    root.render(
        <ChatbotPanel session={session} />
    )
}