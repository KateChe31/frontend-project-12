import { io } from 'socket.io-client';

const createSocket = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  return io('http://localhost:5001', {
    auth: { 
      token,
      username: user?.username || 'unknown',
    },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 3000,
    transports: ['websocket'],
  });
};

const socket = createSocket();

// Логирование всех событий для отладки
socket.onAny((event, ...args) => {
  console.log('[WebSocket Event]', event, args);
});

export default socket;
