import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import env from './env.js';
import { fileURLToPath } from 'node:url';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow Pro API Specification',
      version: '1.0.0',
      description: 'Production-ready RESTful API for TaskFlow Pro multi-tenant SaaS project management platform.',
      contact: {
        name: 'TaskFlow Pro Backend Team',
        email: 'support@taskflowpro.com',
      },
    },
    servers: [
      {
        url: `${env.API_BASE_URL}/api/v1`,
        description: `${env.NODE_ENV} server`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: [fileURLToPath(new URL('../routes/*.js', import.meta.url)).replaceAll('\\', '/')],
};

const swaggerSpec = swaggerJsDoc(options);

export const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default setupSwagger;
