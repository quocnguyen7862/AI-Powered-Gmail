import { Socket } from "socket.io-client";

let socket;

export function connectToSocket(userId) {
    if (socket) return socket;

    socket = io('http://localhost:3001/api', {
        path: '/socket.io',
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

    ocket.on('emailsRead', (data) => {
        console.log('📥 Received emailsRead:', data);

        // Gửi thông báo trình duyệt (Browser Notification API)
        if (Notification.permission === 'granted') {
            new Notification(data.message, {
                icon: 'icon-128.png', // icon của extension nếu có
                body: `Email IDs: ${data.emailIds.join(', ')}`,
            });
        } else {
            Notification.requestPermission();
        }
    });

    return socket

}