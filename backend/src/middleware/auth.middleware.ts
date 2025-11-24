import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, extractTokenFromHeader } from '@utils/jwt.utils';

// Extend Fastify types
declare module 'fastify' {
  interface FastifyRequest {
    currentUser?: {
      userId: string;
      email: string;
      username: string;
    };
  }

  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
    authenticateOptional: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const token = extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication required',
      });
    }

    const decoded = await verifyToken(request, token);

    request.currentUser = {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
    };
  } catch (error: any) {
    return reply.status(401).send({
      success: false,
      error: error.message || 'Invalid or expired token',
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user to request if token is present and valid
 * Does not fail if token is missing or invalid
 */
export async function authenticateOptional(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const token = extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      return;
    }

    const decoded = await verifyToken(request, token);

    request.currentUser = {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
    };
  } catch (error) {
    // Silently fail for optional authentication
    // Request continues without user attached
  }
}
