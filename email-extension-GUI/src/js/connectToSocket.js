import { io, Socket } from "socket.io-client";
import { serverConfig } from "./config";

let socket;

export function connectToSocket(userId) {
    if (socket) return socket;

    socket = io(serverConfig.api, {
        transports: ['websocket'],
        query: {
            userId: userId
        }
    })

    socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
    });

    socket.on('emailRead', (data) => {
        console.log('📥 Received emailsRead:', data);

        // Gửi thông báo trình duyệt (Browser Notification API)
        chrome.runtime.sendMessage({
            type: "email_read",
            message: data,
        })
    });

    return socket

}