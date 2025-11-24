import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import { authenticate, authenticateOptional } from './middleware/auth.middleware';
import { userRoutes } from './services/user/user.routes';
import { projectRoutes } from './services/project/project.routes';

// Load environment variables
dotenv.config();

export async function buildApp(): Promise<FastifyInstance> {
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

  // Create Fastify instance
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      ...(process.env.NODE_ENV === 'development' && {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }),
    },
  });

  // Register Swagger for API documentation
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'AgenticWIT API',
        description: 'Enterprise work item tracking system with accessibility-first design',
        version: '0.1.0',
        contact: {
          name: 'AgenticWIT Team',
          url: 'https://github.com/pranavgk/AgenticWIT',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Development server',
        },
        {
          url: 'https://api-staging.agenticwit.com',
          description: 'Staging server',
        },
        {
          url: 'https://api.agenticwit.com',
          description: 'Production server',
        },
      ],
      tags: [
        { name: 'Authentication', description: 'User authentication and authorization' },
        { name: 'Users', description: 'User profile management' },
        { name: 'Health', description: 'System health checks' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT access token for authentication',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      displayRequestDuration: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // Register plugins
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes',
  });

  await app.register(jwt, {
    secret: JWT_SECRET,
  });

  // Register authentication decorators
  app.decorate('authenticate', authenticate);
  app.decorate('authenticateOptional', authenticateOptional);

  // Health check
  app.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Health check endpoint',
      description: 'Check if the API server is running and healthy',
      response: {
        200: {
          description: 'Server is healthy',
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number', description: 'Server uptime in seconds' },
            environment: { type: 'string', description: 'Current environment (development/staging/production)' },
          },
        },
      },
    },
    handler: async () => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      };
    },
  });

  // API info
  app.get('/api', {
    schema: {
      tags: ['Health'],
      summary: 'API information',
      description: 'Get basic information about the API and available endpoints',
      response: {
        200: {
          description: 'API information',
          type: 'object',
          properties: {
            name: { type: 'string' },
            version: { type: 'string' },
            description: { type: 'string' },
            documentation: { type: 'string', description: 'Link to API documentation' },
            endpoints: { type: 'object' },
          },
        },
      },
    },
    handler: async () => {
      return {
        name: 'AgenticWIT API',
        version: '0.1.0',
        description: 'Enterprise work item tracking system',
        documentation: '/docs',
        endpoints: {
          health: '/health',
          api: '/api',
          docs: '/docs',
          auth: '/api/auth',
          users: '/api/users',
        },
      };
    },
  });

  // Register routes
  await app.register(userRoutes);
  await app.register(projectRoutes);

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    reply.status(statusCode).send({
      error: {
        statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      },
    });
  });

  return app;
}
