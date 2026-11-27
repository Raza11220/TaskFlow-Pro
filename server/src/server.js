import httpServer from './httpServer.js';
import connectDatabase from './config/database.js';
import initBackgroundJobs from './jobs/index.js';
import env from './config/env.js';
import logger from './config/logger.js';

const startServer = async () => {
  await connectDatabase();

  if (env.NODE_ENV !== 'test') {
    initBackgroundJobs();
  }

  httpServer.listen(env.PORT, () => {
    logger.info(`🚀 TaskFlow Pro API running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`📚 Swagger UI documentation available at: ${env.API_BASE_URL}/api/docs`);
  });

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    httpServer.close(async () => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
