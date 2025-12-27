import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private userSockets: Map<number, Set<string>> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove from user sockets
    this.userSockets.forEach((sockets, userId) => {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    });
  }

  @SubscribeMessage('register-user')
  handleRegisterUser(client: Socket, userId: number) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    this.logger.log(`User ${userId} registered with socket ${client.id}`);
  }

  // Emit event when a card is added
  emitCardAdded(groupId: string, card: any) {
    this.logger.log(`Emitting card-added event for group ${groupId}`);
    this.server.emit('card-added', { groupId, card });
  }

  // Emit event when a group is updated
  emitGroupUpdated(groupId: string) {
    this.logger.log(`Emitting group-updated event for group ${groupId}`);
    this.server.emit('group-updated', { groupId });
  }

  // Emit event when groups list changes
  emitGroupsChanged() {
    this.logger.log('Emitting groups-changed event');
    this.server.emit('groups-changed');
  }

  // Emit notification to specific user
  emitNotification(userId: number, notification: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('notification', notification);
      });
      this.logger.log(`Emitting notification to user ${userId}`);
    }
  }

  // Emit notification count update
  emitNotificationCount(userId: number, count: number) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('notification-count', count);
      });
    }
  }
}
