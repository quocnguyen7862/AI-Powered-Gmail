import React from "react";
import { createRoot } from "react-dom/client";
import ReplyQuickPopup from "./ReplyQuickPopup/ReplyQuickPopup";
import SummaryPopup from "./SummaryPopup/SummaryPopup";

export function createReplyQuickPopup({ el, threadId, draftId, composeView }) {
    const root = createRoot(el);
    root.render(
        <ReplyQuickPopup threadId={threadId} draftId={draftId} composeView={composeView} />
    );
}

export function createSummaryPopup({ el, threadId, messageId }) {
    const root = createRoot(el);
    root.render(
        <SummaryPopup threadId={threadId} messageId={messageId} />
    );
}