// socket.js
import { io } from 'socket.io-client'

export const createSocket = (token, username) => {
  return io('http://localhost:5001', {
    auth: {
      token,
      username,
    },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 3000,
    transports: ['websocket'],
  })
}
