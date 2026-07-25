import Fastify, { FastifyInstance, FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { config } from '../config/app';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      transport: config.env === 'development' ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      } : undefined
    }
  });

  // Register Swagger (OpenAPI)
  app.register(require('@fastify/swagger'), {
    openapi: {
      openapi: '3.1.0',
      info: { title: 'SchemaFlow API', version: '1.0.0' },
    }
  });
  app.register(require('@fastify/swagger-ui'), {
    routePrefix: '/api/docs',
  });

  // Register Middleware
  app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });
  app.register(helmet);
  app.register(require('@fastify/cookie'));

  // Register Routes
  app.register(require('../modules/auth/routes/auth.routes').authRoutes, { prefix: '/api/v1/auth' });
  app.register(require('../modules/project/routes/project.routes').projectRoutes, { prefix: '/api/v1/projects' });
  app.register(require('../modules/diagram/routes/diagram.routes').diagramRoutes, { prefix: '/api/v1' });
  app.register(require('../modules/schema/routes/schema.routes').schemaRoutes, { prefix: '/api/v1' });
  app.register(require('../modules/version/routes/version.routes').versionRoutes, { prefix: '/api/v1' });
  app.register(require('../modules/parser/routes/parser.routes').parserRoutes, { prefix: '/api/v1' });

  // Health check route
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  });

  // 404 handler
  app.setNotFoundHandler((req, reply) => {
    reply.status(404).send({ success: false, error: 'Route not found' });
  });

  // Global Error Handler
  app.setErrorHandler((error: FastifyError, request, reply) => {
    app.log.error(error);
    reply.status(error.statusCode || 500).send({
      success: false,
      error: {
        code: error.name || 'INTERNAL_SERVER_ERROR',
        message: error.message || 'An unexpected error occurred',
      },
    });
  });

  return app;
}
