import React from "react";
import { createRoot } from "react-dom/client";
import ReplyQuickPopup from "./ReplyQuickPopup/ReplyQuickPopup";
import SummaryPopup from "./SummaryPopup/SummaryPopup";

export function createReplyQuickPopup({ el, inboxContent, threadId }) {
    const root = createRoot(el);
    root.render(
        <ReplyQuickPopup inboxContent={inboxContent} threadId={threadId} />
    );
}

export function createSummaryPopup({ el }) {
    const root = createRoot(el);
    root.render(
        <SummaryPopup />
    );
}