import { describe, it, expect } from '@jest/globals';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../../src/services/user/user.types';

describe('User Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const data = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'Test123!@#',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short username', () => {
      const data = {
        email: 'test@example.com',
        username: 'ab',
        password: 'Test123!@#',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject username with invalid characters', () => {
      const data = {
        email: 'test@example.com',
        username: 'test@user',
        password: 'Test123!@#',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const data = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'weak',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept optional MFA code', () => {
      const data = {
        email: 'test@example.com',
        password: 'Test123!@#',
        mfaCode: '123456',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid',
        password: 'Test123!@#',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate profile update', () => {
      const data = {
        firstName: 'Updated',
        theme: 'dark',
        fontSize: 'large',
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept partial updates', () => {
      const data = {
        firstName: 'Updated',
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept accessibility preferences', () => {
      const data = {
        reduceMotion: true,
        screenReaderMode: true,
        keyboardNavOnly: true,
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid theme', () => {
      const data = {
        theme: 'invalid',
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid fontSize', () => {
      const data = {
        fontSize: 'huge',
      };

      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate password change', () => {
      const data = {
        currentPassword: 'Old123!@#',
        newPassword: 'New456!@#',
      };

      const result = changePasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject weak new password', () => {
      const data = {
        currentPassword: 'Old123!@#',
        newPassword: 'weak',
      };

      const result = changePasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require both passwords', () => {
      const data = {
        currentPassword: 'Old123!@#',
      };

      const result = changePasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
