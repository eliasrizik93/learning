import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { getAllGroups } from '../store/slices/groupSlice';
import { addNotification, updateUnreadCount } from '../store/slices/notificationSlice';
import type { AppDispatch, RootState } from '../store/store';
import type { Notification } from '../types';

const SOCKET_URL = 'http://localhost:3000';

export function useSocket() {
  const dispatch = useDispatch<AppDispatch>();
  const socketRef = useRef<Socket | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuth = useSelector((state: RootState) => state.auth.isAuth);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to server');
      // Register user for notifications
      if (isAuth && user?.id) {
        socket.emit('register-user', user.id);
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });

    // Listen for card-added events
    socket.on('card-added', (data: { groupId: string; card: any }) => {
      console.log('[Socket] Card added:', data);
      // Refresh groups to get updated data
      dispatch(getAllGroups());
    });

    // Listen for group-updated events
    socket.on('group-updated', (data: { groupId: string }) => {
      console.log('[Socket] Group updated:', data);
      dispatch(getAllGroups());
    });

    // Listen for groups-changed events
    socket.on('groups-changed', () => {
      console.log('[Socket] Groups changed');
      dispatch(getAllGroups());
    });

    // Listen for notification events
    socket.on('notification', (notification: Notification) => {
      console.log('[Socket] Notification received:', notification);
      dispatch(addNotification(notification));
    });

    // Listen for notification count updates
    socket.on('notification-count', (count: number) => {
      dispatch(updateUnreadCount(count));
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [dispatch, isAuth, user?.id]);

  // Re-register when user changes
  useEffect(() => {
    if (socketRef.current?.connected && isAuth && user?.id) {
      socketRef.current.emit('register-user', user.id);
    }
  }, [isAuth, user?.id]);

  return socketRef.current;
}
