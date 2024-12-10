import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

export type NotificationType = 'assignment' | 'announcement' | 'grade';
export interface Notification {
  type: NotificationType;
  title: string;
  message: string;
}

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
          duration: 6000,
          variant: notification.type === 'assignment' ? 'default' : 'destructive',
          className: `${
            notification.type === 'assignment' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-destructive text-destructive-foreground'
          } fixed top-4 right-4 z-50`,
        });
      });

      return () => {
        socket?.off('notification');
      };
    }
  }, [courseId, toast]);

  const sendNotification = useCallback((notification: Notification) => {
    if (socket && courseId) {
      socket.emit('notify', { ...notification, courseId });
    }
  }, [courseId]);

  return { sendNotification };
}
