import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import env from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';
import routes from './routes/index.js';
import setupSwagger from './config/swagger.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '5mb',
  })
);

app.use(cookieParser());
app.use(compression());

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Swagger Documentation
setupSwagger(app);

// Root Welcome
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to TaskFlow Pro API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// Operational Liveness & Readiness Probes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/ready', (req, res) => {
  const dbState = mongoose.connection.readyState;
  if (dbState === 1) {
    return res.status(200).json({
      success: true,
      status: 'ready',
      database: 'connected',
    });
  }
  return res.status(503).json({
    success: false,
    status: 'unready',
    database: 'disconnected',
  });
});

// Mount V1 API Routes with Rate Limiting
app.use('/api/v1', apiLimiter, routes);

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
