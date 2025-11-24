import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { authenticate, authenticateOptional } from './middleware/auth.middleware';
import { userRoutes } from './services/user/user.routes';

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

  // Register plugins
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
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
  app.get('/health', async () => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };
  });

  // API info
  app.get('/api', async () => {
    return {
      name: 'AgenticWIT API',
      version: '0.1.0',
      description: 'Enterprise work item tracking system',
      endpoints: {
        health: '/health',
        api: '/api',
        auth: '/api/auth',
        users: '/api/users',
      },
    };
  });

  // Register routes
  await app.register(userRoutes);

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
