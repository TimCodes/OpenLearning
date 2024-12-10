import { useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

export type NotificationType = 'assignment' | 'announcement' | 'grade';
export interface Notification {
  type: NotificationType;
  title: string;
  message: string;
}

export function useNotifications(courseId?: number) {
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!socketRef.current) {
      const socket = io({
        path: "/socket.io",
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
        timeout: 20000
      });

      socket.on('connect', () => {
        console.log('Connected to notification server');
        if (courseId) {
          socket.emit('subscribe', { courseId });
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Failed to connect to notification server:', error);
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason);
        if (reason === "io server disconnect") {
          socket.connect();
        }
      });

      socket.on('notification', (notification) => {
        toast({
          title: notification.title,
          description: notification.message,
          duration: 6000,
          variant: notification.type === 'assignment' ? 'default' : 'destructive',
        });
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [courseId, toast]);

  const sendNotification = useCallback((notification: Notification) => {
    if (socketRef.current && courseId) {
      socketRef.current.emit('notify', { ...notification, courseId });
    }
  }, [courseId]);

  return { sendNotification };
}
