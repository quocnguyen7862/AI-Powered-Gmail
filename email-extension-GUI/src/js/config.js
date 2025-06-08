export const serverConfig = {
    api: process.env.API_URL,
    client_url: process.env.API_CLIENT,
}

export const URL_GMAIL_AUTH = 'api/auth/google'
export const URL_SAVE_SENT_EMAIL = 'api/tracking/save-sent'
export const URL_TRACKING_STATUS = 'api/tracking/status'
export const URL_SUMMARIZE_BY_MESSAGE = 'api/summarize/by-message'
export const URL_SUMMARIZE_BY_DRAFT = 'api/summarize/by-draft'
export const URL_REPLY_SCENARIO = 'api/summarize/reply-scenario'
export const URL_REPLY_GENERATE = 'api/summarize/reply-generate'
export const URL_CHAT_HISTORY = 'api/summarize/chat-history'
export const URL_THREADS_HISTORY = 'api/summarize/thread-history'
export const URL_AUTH_CHECK = 'api/auth/check'
export const URL_AUTH_LOGOUT = 'api/auth/logout'
export const URL_TRACKING_STATS = 'api/tracking/stats'
export const URL_CHATBOT = 'api/summarize/chatbot'
export const URL_SEARCH = 'api/summarize/search'
export const URL_LABEL = 'api/label'
export const URL_RE_SUMMARIZE = "api/summarize/regenerate";
export const URL_TRACKING_TRACK = "api/tracking/track";
export const URL_TRACKING_READED = "api/tracking/readed";