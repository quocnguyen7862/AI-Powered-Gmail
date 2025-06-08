import React from "react";
import { createRoot } from "react-dom/client";
import ReplyQuickPopup from "./ReplyQuickPopup/ReplyQuickPopup";
import SummaryPopup, { SummaryButton } from "./SummaryPopup/SummaryPopup";
import AppMenuPopup from "./AppMenuPopup/AppMenuPopup";
import ChatbotPanel from "./ChatbotPanel/ChatbotPanel";
import SelectLabels from "./SelectLabels/SelectLabels";
import TrackingPanel from "./TrackingPanel/TrackingPanel";

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

export function createSummaryButton({ el, threadId, messageId, session }) {
    const root = getOrCreateRoot(el);
    root.render(
        <SummaryButton threadId={threadId} messageId={messageId} session={session} />
    );
}

export function createAppMenuPopup({ el, email, session, }) {
    const root = getOrCreateRoot(el);
    root.render(
        <AppMenuPopup email={email} session={session} />
    )
}

export function createChatbotPanel({ el, session, thread }) {
    const root = getOrCreateRoot(el);
    root.render(
        <ChatbotPanel session={session} el={el} thread={thread} />
    )
}

export function createSelectLabels({ el, session }) {
    const root = getOrCreateRoot(el);
    root.render(
        <SelectLabels session={session} />
    )
}

export function createTrackingPanel({ el, trackings }) {
    const root = getOrCreateRoot(el);
    root.render(
        <TrackingPanel trackings={trackings} />
    )
}

export function destroyComponent(el) {
    if (el.__reactRoot) {
        el.__reactRoot.unmount();
        delete el.__reactRoot;
    }
}
