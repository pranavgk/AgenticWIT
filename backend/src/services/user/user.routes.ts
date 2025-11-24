import { FastifyInstance } from 'fastify';
import * as userController from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';

/**
 * Register user authentication and profile routes
 */
export async function userRoutes(fastify: FastifyInstance) {
  // Authentication routes (public)
  fastify.post('/api/auth/register', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '15 minutes',
      },
    },
    handler: userController.register,
  });

  fastify.post('/api/auth/login', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '15 minutes',
      },
    },
    handler: userController.login,
  });

  fastify.post('/api/auth/refresh', {
    config: {
      rateLimit: {
        max: 20,
        timeWindow: '15 minutes',
      },
    },
    handler: userController.refreshToken,
  });

  // Profile routes (protected)
  fastify.get('/api/users/me', {
    preHandler: authenticate,
    handler: userController.getProfile,
  });

  fastify.patch('/api/users/me', {
    preHandler: authenticate,
    handler: userController.updateProfile,
  });

  fastify.post('/api/users/me/password', {
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '15 minutes',
      },
    },
    handler: userController.changePassword,
  });

  fastify.post('/api/auth/logout', {
    preHandler: authenticate,
    handler: userController.logout,
  });
}
