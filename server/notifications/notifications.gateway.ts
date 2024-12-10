import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  cors: true,
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private notificationsService: NotificationsService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    this.notificationsService.addClient(client);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    this.notificationsService.removeClient(client);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { courseId: number }): WsResponse<string> {
    this.notificationsService.subscribeToCourse(client, payload.courseId);
    return { event: 'subscribed', data: `Subscribed to course ${payload.courseId}` };
  }
}
