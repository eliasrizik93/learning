import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
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

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
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
}
