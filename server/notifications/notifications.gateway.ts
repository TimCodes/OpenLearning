import { Server } from 'socket.io';
import { createServer } from 'http';
import type { Express } from 'express';

const clients = new Map<string, Set<number>>();

export function setupNotifications(app: Express, server: ReturnType<typeof createServer>) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:5000",
      methods: ["GET", "POST"],
      credentials: true
    },
    path: "/socket.io",
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('subscribe', ({ courseId }) => {
      try {
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
      } catch (error) {
        console.error('Subscribe error:', error);
      }
    });

    socket.on('notify', ({ courseId, type, title, message }) => {
      try {
        // Broadcast to all clients subscribed to this course
        clients.forEach((courses, clientId) => {
          if (courses.has(courseId)) {
            io.to(clientId).emit('notification', { type, title, message });
          }
        });
      } catch (error) {
        console.error('Notify error:', error);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected (${reason}):`, socket.id);
      clients.delete(socket.id);
    });
  });

  return io;
}
