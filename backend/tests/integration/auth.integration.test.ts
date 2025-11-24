import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import { buildApp } from '../../src/app';

describe('Authentication Integration Tests', () => {
  let app: FastifyInstance;
  let request: any; // supertest.SuperTest<supertest.Test>
  
  const generateTestUser = () => ({
    email: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
    username: `testuser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'User',
  });

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    request = supertest(app.server);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const testUser = generateTestUser();
      const response = await request
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User registered successfully',
      });
      expect(response.body.data.user).toMatchObject({
        email: testUser.email,
        username: testUser.username,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
      });
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const testUser = generateTestUser();
      // Register once
      await request
        .post('/api/auth/register')
        .send(testUser);
      
      // Try to register again
      const response = await request
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should reject weak password', async () => {
      const testUser = generateTestUser();
      const response = await request
        .post('/api/auth/register')
        .send({
          ...testUser,
          password: 'weak',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid email', async () => {
      const testUser = generateTestUser();
      const response = await request
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser: ReturnType<typeof generateTestUser>;
    
    beforeAll(async () => {
      // Register a user for login tests
      testUser = generateTestUser();
      await request
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
      });
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject incorrect password', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const response = await request
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/me', () => {
    let accessToken: string;
    let testUser: ReturnType<typeof generateTestUser>;

    beforeAll(async () => {
      // Register and login
      testUser = generateTestUser();
      await request.post('/api/auth/register').send(testUser);
      
      const loginResponse = await request
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      accessToken = loginResponse.body.data.accessToken;
    });

    it('should get user profile with valid token', async () => {
      const response = await request
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        email: testUser.email,
        username: testUser.username,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
      });
      expect(response.body.data.password).toBeUndefined();
    });

    it('should reject request without token', async () => {
      const response = await request
        .get('/api/users/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/users/me', () => {
    let accessToken: string;
    let testUser: ReturnType<typeof generateTestUser>;

    beforeAll(async () => {
      // Register and login
      testUser = generateTestUser();
      await request.post('/api/auth/register').send(testUser);
      
      const loginResponse = await request
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      accessToken = loginResponse.body.data.accessToken;
    });

    it('should update user profile', async () => {
      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
        accessibilityPreferences: {
          theme: 'dark',
          fontSize: 'large',
        },
      };

      const response = await request
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        firstName: 'Updated',
        lastName: 'Name',
      });
    });

    it('should reject invalid email format', async () => {
      const response = await request
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;
    let testUser: ReturnType<typeof generateTestUser>;

    beforeAll(async () => {
      // Register and login
      testUser = generateTestUser();
      await request.post('/api/auth/register').send(testUser);
      
      const loginResponse = await request
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should refresh access token', async () => {
      const response = await request
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.refreshToken).not.toBe(refreshToken); // Token rotation
    });

    it('should reject invalid refresh token', async () => {
      const response = await request
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;
    let refreshToken: string;
    let testUser: ReturnType<typeof generateTestUser>;

    beforeEach(async () => {
      // Register and login for each test
      testUser = generateTestUser();
      await request.post('/api/auth/register').send(testUser);
      
      const loginResponse = await request
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      accessToken = loginResponse.body.data.accessToken;
      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should logout successfully', async () => {
      const response = await request
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logout successful');
    });

    it('should invalidate refresh token after logout', async () => {
      await request
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      const response = await request
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limit on registration', async () => {
      const requests = Array(6).fill(null).map((_, i) => {
        const testUser = generateTestUser();
        return request
          .post('/api/auth/register')
          .send(testUser);
      });

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);
      
      expect(rateLimited).toBe(true);
    }, 30000); // Increase timeout for rate limiting test
  });
});
