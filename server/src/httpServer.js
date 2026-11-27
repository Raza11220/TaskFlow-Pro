import { createServer } from 'node:http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDatabase from './config/database.js';
import configureSockets from './sockets/index.js';
import env from './config/env.js';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: env.CLIENT_URL, credentials: true },
  // A WebSocket stays on one function instance; polling needs sticky sessions.
  transports: process.env.VERCEL ? ['websocket'] : ['websocket', 'polling'],
});

io.use(async (_socket, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});
configureSockets(io);
app.set('io', io);

export default httpServer;
