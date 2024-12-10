import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  path: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private notificationsService: NotificationsService) {}

  handleConnection(client: WebSocket) {
    // Store client connection
    this.notificationsService.addClient(client);
  }

  handleDisconnect(client: WebSocket) {
    // Remove client connection
    this.notificationsService.removeClient(client);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: WebSocket, payload: { courseId: number }) {
    this.notificationsService.subscribeToCourse(client, payload.courseId);
  }
}
