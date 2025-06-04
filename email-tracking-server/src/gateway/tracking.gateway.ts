// tracking.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class TrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.clients.set(userId, client);
      console.log(`✅ Client connected: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socket] of this.clients.entries()) {
      if (socket.id === client.id) {
        this.clients.delete(userId);
        console.log(`❌ Client disconnected: ${userId}`);
        break;
      }
    }
  }

  notifyEmailRead(userId: string, emailId: string) {
    const client = this.clients.get(userId);
    if (client) {
      client.emit('emailRead', {
        emailId,
        message: `Email ${emailId} đã được đọc.`,
      });
    } else {
      console.warn(`⚠️ No client found for user ${userId}`);
    }
  }
}
