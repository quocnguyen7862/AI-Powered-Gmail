export const serverConfig = {
    api: process.env.API_URL,
    client_url: process.env.API_CLIENT,
}

export const URL_GMAIL_AUTH = 'auth/google'
export const URL_SAVE_SENT_EMAIL = 'tracking/save-sent'
export const URL_TRACKING_STATUS = 'tracking/status'
export const URL_SUMMARIZE_BY_MESSAGE = 'summarize/by-message'
export const URL_SUMMARIZE_BY_DRAFT = 'summarize/by-draft'
export const URL_REPLY_SCENARIO = 'summarize/reply-scenario'
export const URL_REPLY_GENERATE = 'summarize/reply-generate'
export const URL_CHAT_HISTORY = 'summarize/chat-history'
export const URL_THREADS_HISTORY = 'summarize/thread-history'
export const URL_AUTH_CHECK = 'auth/check'
export const URL_AUTH_LOGOUT = 'auth/logout'
export const URL_TRACKING_STATS = 'tracking/stats'
export const URL_CHATBOT = 'summarize/chatbot'
export const URL_SEARCH = 'summarize/search'
export const URL_LABEL = 'label'
export const URL_RE_SUMMARIZE = "summarize/regenerate";
export const URL_TRACKING_TRACK = "tracking/track";