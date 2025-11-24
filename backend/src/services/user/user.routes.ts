import { FastifyInstance } from 'fastify';
import * as userController from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';

/**
 * Register user authentication and profile routes with OpenAPI documentation
 */
export async function userRoutes(fastify: FastifyInstance) {
  // Authentication routes (public)
  fastify.post('/api/auth/register', {
    schema: {
      tags: ['Authentication'],
      summary: 'Register a new user',
      description: 'Create a new user account with email, username, and password',
      body: {
        type: 'object',
        required: ['email', 'username', 'password', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email', description: 'User email address' },
          username: { type: 'string', minLength: 3, maxLength: 30, description: 'Unique username' },
          password: { type: 'string', minLength: 8, description: 'Password (min 8 chars, mixed case, numbers, special chars)' },
          firstName: { type: 'string', minLength: 1, description: 'First name' },
          lastName: { type: 'string', minLength: 1, description: 'Last name' },
        },
      },
      response: {
        201: {
          description: 'User registered successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    username: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                  },
                },
                accessToken: { type: 'string', description: 'JWT access token (15 min)' },
                refreshToken: { type: 'string', description: 'Refresh token (7 days)' },
              },
            },
          },
        },
        400: {
          description: 'Validation error or user already exists',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '15 minutes',
      },
    },
    handler: userController.register,
  });

  fastify.post('/api/auth/login', {
    schema: {
      tags: ['Authentication'],
      summary: 'User login',
      description: 'Authenticate user with email and password',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', description: 'User email address' },
          password: { type: 'string', description: 'User password' },
        },
      },
      response: {
        200: {
          description: 'Login successful',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    username: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                  },
                },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
              },
            },
          },
        },
        401: {
          description: 'Invalid credentials',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '15 minutes',
      },
    },
    handler: userController.login,
  });

  fastify.post('/api/auth/refresh', {
    schema: {
      tags: ['Authentication'],
      summary: 'Refresh access token',
      description: 'Get a new access token using a valid refresh token. Implements token rotation.',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', description: 'Valid refresh token' },
        },
      },
      response: {
        200: {
          description: 'Token refreshed successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string', description: 'New JWT access token' },
                refreshToken: { type: 'string', description: 'New refresh token (old one invalidated)' },
              },
            },
          },
        },
        401: {
          description: 'Invalid or expired refresh token',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
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
    schema: {
      tags: ['Users'],
      summary: 'Get current user profile',
      description: 'Retrieve the authenticated user\'s profile information',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Profile retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                username: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                accessibilityPreferences: {
                  type: 'object',
                  properties: {
                    theme: { type: 'string', enum: ['light', 'dark', 'high-contrast'] },
                    fontSize: { type: 'string', enum: ['small', 'medium', 'large', 'extra-large'] },
                    reduceMotion: { type: 'boolean' },
                    screenReaderMode: { type: 'boolean' },
                    keyboardNavOnly: { type: 'boolean' },
                  },
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - Invalid or missing token',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: authenticate,
    handler: userController.getProfile,
  });

  fastify.patch('/api/users/me', {
    schema: {
      tags: ['Users'],
      summary: 'Update user profile',
      description: 'Update the authenticated user\'s profile information',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', description: 'New email address' },
          username: { type: 'string', minLength: 3, maxLength: 30, description: 'New username' },
          firstName: { type: 'string', description: 'First name' },
          lastName: { type: 'string', description: 'Last name' },
          displayName: { type: 'string', description: 'Display name' },
          accessibilityPreferences: {
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['light', 'dark', 'high-contrast'] },
              fontSize: { type: 'string', enum: ['small', 'medium', 'large', 'extra-large'] },
              reduceMotion: { type: 'boolean' },
              screenReaderMode: { type: 'boolean' },
              keyboardNavOnly: { type: 'boolean' },
            },
          },
        },
      },
      response: {
        200: {
          description: 'Profile updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        400: {
          description: 'Validation error',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: authenticate,
    handler: userController.updateProfile,
  });

  fastify.post('/api/users/me/password', {
    schema: {
      tags: ['Users'],
      summary: 'Change password',
      description: 'Change the authenticated user\'s password',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', description: 'Current password for verification' },
          newPassword: { type: 'string', minLength: 8, description: 'New password (min 8 chars, mixed case, numbers, special chars)' },
        },
      },
      response: {
        200: {
          description: 'Password changed successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        400: {
          description: 'Validation error or weak password',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        401: {
          description: 'Unauthorized or incorrect current password',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
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
    schema: {
      tags: ['Authentication'],
      summary: 'User logout',
      description: 'Invalidate the user\'s refresh token and log out',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', description: 'Refresh token to invalidate' },
        },
      },
      response: {
        200: {
          description: 'Logout successful',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: authenticate,
    handler: userController.logout,
  });
}
