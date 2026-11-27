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
import connectDatabase from './config/database.js';
import { runDailyJobs } from './jobs/index.js';

const app = express();

if (process.env.VERCEL) app.set('trust proxy', 1);

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

app.get('/api/ready', async (req, res) => {
  try {
    await connectDatabase();
  } catch {
    // Readiness returns 503 while the database is unavailable.
  }
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
app.get('/api/jobs/daily', async (req, res, next) => {
  if (!env.CRON_SECRET || req.headers.authorization !== `Bearer ${env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    await connectDatabase();
    await runDailyJobs();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.use('/api/v1', apiLimiter, async (_req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch {
    res.status(503).json({ success: false, message: 'Database unavailable. Please try again.', code: 'DATABASE_UNAVAILABLE' });
  }
}, routes);

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
