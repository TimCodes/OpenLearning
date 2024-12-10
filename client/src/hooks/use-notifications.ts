import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

let socket: Socket | null = null;

export function useNotifications(courseId?: number) {
  const { toast } = useToast();

  // Initialize socket connection
  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:5000/notifications', {
        withCredentials: true,
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log('Connected to notification server');
      });

      socket.on('connect_error', (error) => {
        console.error('Failed to connect to notification server:', error);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

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
        socket.off('notification');
      };
    }
  }, [courseId, toast]);

  // Function to send a notification (for teachers)
  const sendNotification = useCallback(
    (notification: {
      type: 'assignment' | 'announcement' | 'grade';
      title: string;
      message: string;
    }) => {
      if (socket && courseId) {
        socket.emit('notify', { ...notification, courseId });
      }
    },
    [courseId]
  );

  return { sendNotification };
}
