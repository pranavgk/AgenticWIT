import { FastifyRequest, FastifyReply } from 'fastify';
import * as userService from './user.service';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from './user.types';

/**
 * Register a new user
 */
export async function register(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = registerSchema.parse(request.body);
    const result = await userService.registerUser(request, data);

    reply.status(201).send({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    reply.status(400).send({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
}

/**
 * Login user
 */
export async function login(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = loginSchema.parse(request.body);
    const result = await userService.loginUser(request, data);

    reply.status(200).send({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    reply.status(401).send({
      success: false,
      error: error.message || 'Authentication failed',
    });
  }
}

/**
 * Get current user profile
 */
export async function getProfile(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = (request.currentUser as any).userId;
    const user = await userService.getUserById(userId);

    reply.status(200).send({
      success: true,
      data: user,
    });
  } catch (error: any) {
    reply.status(404).send({
      success: false,
      error: error.message || 'User not found',
    });
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = (request.currentUser as any).userId;
    const data = updateProfileSchema.parse(request.body);
    const user = await userService.updateUserProfile(userId, data);

    reply.status(200).send({
      success: true,
      data: user,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    reply.status(400).send({
      success: false,
      error: error.message || 'Profile update failed',
    });
  }
}

/**
 * Change user password
 */
export async function changePassword(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = (request.currentUser as any).userId;
    const data = changePasswordSchema.parse(request.body);
    await userService.changeUserPassword(userId, data);

    reply.status(200).send({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    reply.status(400).send({
      success: false,
      error: error.message || 'Password change failed',
    });
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { refreshToken } = request.body as { refreshToken: string };

    if (!refreshToken) {
      return reply.status(400).send({
        success: false,
        error: 'Refresh token is required',
      });
    }

    const result = await userService.refreshAccessToken(request, refreshToken);

    reply.status(200).send({
      success: true,
      data: result,
    });
  } catch (error: any) {
    reply.status(401).send({
      success: false,
      error: error.message || 'Token refresh failed',
    });
  }
}

/**
 * Logout user
 */
export async function logout(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = (request.currentUser as any).userId;
    const { refreshToken } = request.body as { refreshToken: string };

    if (!refreshToken) {
      return reply.status(400).send({
        success: false,
        error: 'Refresh token is required',
      });
    }

    await userService.logoutUser(userId, refreshToken);

    reply.status(200).send({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    reply.status(400).send({
      success: false,
      error: error.message || 'Logout failed',
    });
  }
}
