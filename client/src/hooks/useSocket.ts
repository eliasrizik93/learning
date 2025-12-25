import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { getAllGroups } from '../store/slices/groupSlice';
import type { AppDispatch } from '../store/store';

const SOCKET_URL = 'http://localhost:3000';

export function useSocket() {
  const dispatch = useDispatch<AppDispatch>();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to server');
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

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return socketRef.current;
}
