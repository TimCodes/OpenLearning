import { Server } from 'socket.io';
import { createServer } from 'http';
import type { Express } from 'express';

const clients = new Map<string, Set<number>>();

export function setupNotifications(app: Express, server: ReturnType<typeof createServer>) {
  const io = new Server(server, {
    path: '/notifications',
    cors: {
      origin: true,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe', ({ courseId }) => {
      if (!clients.has(socket.id)) {
        clients.set(socket.id, new Set());
      }
      clients.get(socket.id)?.add(courseId);
      console.log(`Client ${socket.id} subscribed to course ${courseId}`);
      socket.emit('notification', {
        type: 'info',
        title: 'Connected',
        message: `You are now receiving notifications for course ${courseId}`
      });
    });

    socket.on('notify', ({ courseId, type, title, message }) => {
      // Broadcast to all clients subscribed to this course
      for (const [clientId, courses] of clients.entries()) {
        if (courses.has(courseId)) {
          io.to(clientId).emit('notification', { type, title, message });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      clients.delete(socket.id);
    });
  });

  return io;
}
