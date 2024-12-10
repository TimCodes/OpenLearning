import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';

@Injectable()
export class NotificationsService {
  private clients: Map<WebSocket, Set<number>> = new Map();

  addClient(client: WebSocket) {
    this.clients.set(client, new Set());
  }

  removeClient(client: WebSocket) {
    this.clients.delete(client);
  }

  subscribeToCourse(client: WebSocket, courseId: number) {
    const courses = this.clients.get(client);
    if (courses) {
      courses.add(courseId);
    }
  }

  notifyCourseMember(courseId: number, event: string, data: any) {
    this.clients.forEach((courses, client) => {
      if (courses.has(courseId)) {
        client.send(JSON.stringify({ event, data }));
      }
    });
  }
}
