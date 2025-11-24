import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// Create Fastify instance
const server = Fastify({
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
async function registerPlugins() {
  // Security headers
  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  // CORS
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Rate limiting
  await server.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes',
  });

  // JWT authentication
  await server.register(jwt, {
    secret: JWT_SECRET,
  });
}

// Register routes
async function registerRoutes() {
  // Health check
  server.get('/health', async () => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };
  });

  // API info
  server.get('/api', async () => {
    return {
      name: 'AgenticWIT API',
      version: '0.1.0',
      description: 'Enterprise work item tracking system',
      endpoints: {
        health: '/health',
        api: '/api',
        docs: '/api/docs',
      },
    };
  });

  // Future routes will be added here
  // await server.register(userRoutes, { prefix: '/api/users' });
  // await server.register(projectRoutes, { prefix: '/api/projects' });
  // await server.register(workItemRoutes, { prefix: '/api/work-items' });
}

// Error handler
server.setErrorHandler((error, request, reply) => {
  server.log.error(error);
  
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

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    await server.listen({ port: PORT, host: HOST });
    
    console.log(`
🚀 AgenticWIT Backend API is running!
    
📍 Server: http://${HOST}:${PORT}
🏥 Health: http://${HOST}:${PORT}/health
📚 API Info: http://${HOST}:${PORT}/api
🌍 Environment: ${process.env.NODE_ENV || 'development'}

Press CTRL+C to stop
    `);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Handle shutdown gracefully
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal} received, closing server gracefully...`);
    await server.close();
    process.exit(0);
  });
});

// Start the server
start();
