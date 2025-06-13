import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
const SocketContext = createContext(null);
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;
export const useSocket = () => useContext(SocketContext);
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
    });
    setSocket(newSocket);
    newSocket.on('connect', () => {
      console.log('[socket] Connected:', newSocket.id);
      newSocket.emit('getUserInfo'); 
      newSocket.on('userInfo', (data) => {
        newSocket.userId = data.userId;  
      });
    });

    newSocket.on('disconnect', () => console.log('[socket] Disconnected'));
    newSocket.on('connect_error', (err) => console.error('[socket] Connect error:', err.message));

    return () => {
      newSocket.disconnect();
      console.log('[socket] Disconnected on unmount');
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
