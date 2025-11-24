import { PrismaClient } from '@prisma/client';
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
  UserResponse,
  AuthResponse,
} from './user.types';
import { hashPassword, comparePassword } from '@/utils/password.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiration,
} from '@/utils/jwt.utils';
import { FastifyRequest } from 'fastify';

const prisma = new PrismaClient();

/**
 * Remove sensitive data from user object
 */
function sanitizeUser(user: any): UserResponse {
  const { password, mfaSecret, ...sanitized } = user;
  return sanitized as UserResponse;
}

/**
 * Register a new user
 */
export async function registerUser(
  request: FastifyRequest,
  data: RegisterInput
): Promise<AuthResponse> {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === data.email) {
      throw new Error('Email already registered');
    }
    throw new Error('Username already taken');
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    },
  });

  // Generate tokens
  const accessToken = await generateAccessToken(
    request,
    user.id,
    user.email,
    user.username
  );
  const refreshToken = generateRefreshToken();

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiration(),
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'USER_REGISTERED',
      resource: 'user',
      details: { email: user.email, username: user.username },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    },
  });

  return {
    user: sanitizeUser(user),
    tokens: {
      accessToken,
      refreshToken,
    },
  };
}

/**
 * Login user
 */
export async function loginUser(
  request: FastifyRequest,
  data: LoginInput
): Promise<AuthResponse> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is disabled');
  }

  // Verify password
  const isPasswordValid = await comparePassword(data.password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Check MFA if enabled
  if (user.mfaEnabled && !data.mfaCode) {
    throw new Error('MFA code required');
  }

  // TODO: Verify MFA code if provided
  // This would be implemented when MFA feature is added

  // Generate tokens
  const accessToken = await generateAccessToken(
    request,
    user.id,
    user.email,
    user.username
  );
  const refreshToken = generateRefreshToken();

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiration(),
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'USER_LOGIN',
      resource: 'user',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    },
  });

  return {
    user: sanitizeUser(user),
    tokens: {
      accessToken,
      refreshToken,
    },
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return sanitizeUser(user);
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<UserResponse> {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'USER_PROFILE_UPDATED',
      resource: 'user',
      details: data,
    },
  });

  return sanitizeUser(user);
}

/**
 * Change user password
 */
export async function changeUserPassword(
  userId: string,
  data: ChangePasswordInput
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(
    data.currentPassword,
    user.password
  );
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await hashPassword(data.newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Invalidate all refresh tokens
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'USER_PASSWORD_CHANGED',
      resource: 'user',
    },
  });
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(
  request: FastifyRequest,
  refreshToken: string
): Promise<AuthResponse> {
  // Find refresh token
  const token = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!token) {
    throw new Error('Invalid refresh token');
  }

  // Check if token is expired
  if (token.expiresAt < new Date()) {
    await prisma.refreshToken.delete({
      where: { id: token.id },
    });
    throw new Error('Refresh token expired');
  }

  // Generate new tokens
  const newAccessToken = await generateAccessToken(
    request,
    token.userId,
    token.user.email,
    token.user.username
  );
  const newRefreshToken = generateRefreshToken();

  // Delete old refresh token and create new one
  await prisma.refreshToken.delete({
    where: { id: token.id },
  });

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: token.userId,
      expiresAt: getRefreshTokenExpiration(),
    },
  });

  return {
    user: sanitizeUser(token.user),
    tokens: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  };
}

/**
 * Logout user
 */
export async function logoutUser(
  userId: string,
  refreshToken: string
): Promise<void> {
  // Delete refresh token
  await prisma.refreshToken.deleteMany({
    where: {
      token: refreshToken,
      userId,
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'USER_LOGOUT',
      resource: 'user',
    },
  });
}
