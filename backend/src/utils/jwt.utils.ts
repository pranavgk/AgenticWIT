import { FastifyRequest, FastifyReply } from 'fastify';
import { randomBytes } from 'crypto';

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  type: 'access' | 'refresh';
}

/**
 * Generate JWT access token
 */
export async function generateAccessToken(
  request: FastifyRequest,
  userId: string,
  email: string,
  username: string
): Promise<string> {
  return request.server.jwt.sign(
    { userId, email, username, type: 'access' },
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(): string {
  return randomBytes(64).toString('hex');
}

/**
 * Verify JWT token
 */
export async function verifyToken(
  request: FastifyRequest,
  token: string
): Promise<TokenPayload> {
  try {
    return request.server.jwt.verify<TokenPayload>(token);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(
  authorization: string | undefined
): string | null {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  return authorization.substring(7);
}

/**
 * Calculate token expiration date
 */
export function getRefreshTokenExpiration(): Date {
  const days = parseInt(process.env.REFRESH_TOKEN_DAYS || '7', 10);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
