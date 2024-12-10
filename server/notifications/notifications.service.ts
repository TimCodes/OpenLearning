import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

interface NotificationPayload {
  type: 'assignment' | 'announcement' | 'grade';
  title: string;
  message: string;
  courseId: number;
  timestamp: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private clients: Map<Socket, Set<number>> = new Map();

  addClient(client: Socket) {
    this.logger.log(`Adding client ${client.id}`);
    this.clients.set(client, new Set());
  }

  removeClient(client: Socket) {
    this.logger.log(`Removing client ${client.id}`);
    this.clients.delete(client);
  }

  subscribeToCourse(client: Socket, courseId: number) {
    const courses = this.clients.get(client);
    if (courses) {
      courses.add(courseId);
      this.logger.log(`Client ${client.id} subscribed to course ${courseId}`);
    }
  }

  notifyCourseMember(courseId: number, payload: NotificationPayload) {
    this.logger.debug(`Sending notification for course ${courseId}`);
    
    this.clients.forEach((courses, client) => {
      if (courses.has(courseId)) {
        client.emit('notification', payload);
      }
    });
  }
}
