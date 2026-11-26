// ─── Socket.IO Client ──────────────────────────────────────────────────────────
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: false,
    })
  }
  return socket
}

export const connectSocket = (organizationId: string): Socket => {
  const s = getSocket()
  if (!s.connected) {
    s.connect()
    s.on('connect', () => {
      s.emit('org:join', { organizationId })
    })
  }
  return s
}

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect()
  }
}

export const joinConversation = (conversationId: string): void => {
  socket?.emit('conversation:join', { conversationId })
}

export const leaveConversation = (conversationId: string): void => {
  socket?.emit('conversation:leave', { conversationId })
}

export const emitTypingStart = (conversationId: string): void => {
  socket?.emit('typing:start', { conversationId })
}

export const emitTypingStop = (conversationId: string): void => {
  socket?.emit('typing:stop', { conversationId })
}

export default getSocket
