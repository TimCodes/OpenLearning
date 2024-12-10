import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

let socket: Socket | null = null;

export function useNotifications(courseId?: number) {
  const { toast } = useToast();

  // Initialize socket connection
  useEffect(() => {
    if (!socket) {
      socket = io({
        path: "/socket.io/",
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true
      });

      socket.on('connect', () => {
        console.log('Connected to notification server');
        toast({
          title: "Connected",
          description: "You will receive real-time updates for this course",
          duration: 3000,
        });
      });

      socket.on('connect_error', (error) => {
        console.error('Failed to connect to notification server:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to notification server. Retrying...",
          variant: "destructive",
        });
      });

      socket.on('disconnect', (reason) => {
        if (reason === "io server disconnect") {
          socket?.connect(); // Reconnect if server disconnected
        }
        toast({
          title: "Disconnected",
          description: "Lost connection to notification server",
          variant: "destructive",
        });
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [toast]);

  // Subscribe to course notifications
  useEffect(() => {
    if (socket && courseId) {
      socket.emit('subscribe', { courseId });

      socket.on('notification', (notification) => {
        toast({
          title: notification.title,
          description: notification.message,
          duration: 5000,
        });
      });

      return () => {
        socket?.off('notification');
      };
    }
  }, [courseId, toast]);

  const sendNotification = useCallback((notification: {
    type: 'assignment' | 'announcement' | 'grade';
    title: string;
    message: string;
  }) => {
    if (socket && courseId) {
      socket.emit('notify', { ...notification, courseId });
    }
  }, [courseId]);

  return { sendNotification };
}
