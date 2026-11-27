// ─── Socket.IO Client ──────────────────────────────────────────────────────────
import { io, Socket } from 'socket.io-client'
import { authService } from './auth.service'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket: Socket | null = null
let activeOrganizationId: string | null = null

const joinOrganization = (): void => {
  if (activeOrganizationId) {
    socket?.emit('org:join', { organizationId: activeOrganizationId })
  }
}

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: false,
      auth: (callback) => {
        void authService
          .refresh()
          .then((token) => callback({ token }))
          .catch((error: unknown) => {
            console.error('Socket authentication failed', error)
            callback({})
          })
      },
    })
    socket.on('connect', joinOrganization)
  }
  return socket
}

export const connectSocket = (organizationId: string): Socket => {
  const s = getSocket()
  activeOrganizationId = organizationId
  if (s.connected) joinOrganization()
  else s.connect()
  return s
}

export const disconnectSocket = (): void => {
  activeOrganizationId = null
  socket?.disconnect()
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
