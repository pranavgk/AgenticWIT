import { FastifyInstance } from 'fastify';
import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import { buildApp } from '../../../src/app';

describe('Project Integration Tests', () => {
  let app: FastifyInstance;
  let request: any;
  let prisma: PrismaClient;
  let authToken: string;
  let userId: string;
  let secondUserId: string;
  let secondUserToken: string;

  const generateTestUser = () => ({
    email: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
    username: `testuser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'User',
  });

  const generateProjectData = () => ({
    name: `Test Project ${Date.now()}`,
    key: `TEST${Math.floor(Math.random() * 1000)}`,
    description: 'Test project description',
    isPublic: false,
    accessibilityLevel: 'AA',
    highContrastMode: false,
    screenReaderOptimized: true,
  });

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    request = supertest(app.server);
    prisma = new PrismaClient();

    // Create and authenticate first test user
    const testUser = generateTestUser();
    const registerResponse = await request.post('/api/auth/register').send(testUser);
    authToken = registerResponse.body.data.tokens.accessToken;
    userId = registerResponse.body.data.user.id;

    // Create and authenticate second test user
    const secondUser = generateTestUser();
    const secondRegisterResponse = await request.post('/api/auth/register').send(secondUser);
    secondUserToken = secondRegisterResponse.body.data.tokens.accessToken;
    secondUserId = secondRegisterResponse.body.data.user.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await prisma.projectMember.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /api/projects', () => {
    it('should create a new project successfully', async () => {
      const projectData = generateProjectData();
      const response = await request
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: projectData.name,
        key: projectData.key,
        description: projectData.description,
        isPublic: projectData.isPublic,
        accessibilityLevel: projectData.accessibilityLevel,
        highContrastMode: projectData.highContrastMode,
        screenReaderOptimized: projectData.screenReaderOptimized,
        ownerId: userId,
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.userRole).toBe('owner');
    });

    it('should reject duplicate project key', async () => {
      const projectData = generateProjectData();
      
      // Create first project
      await request
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData);

      // Try to create with same key
      const response = await request
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });

    it('should reject invalid project key format', async () => {
      const projectData = generateProjectData();
      const response = await request
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...projectData,
          key: 'invalid-key', // lowercase not allowed
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject request without authentication', async () => {
      const projectData = generateProjectData();
      await request
        .post('/api/projects')
        .send(projectData)
        .expect(401);
    });
  });

  describe('GET /api/projects/:id', () => {
    let projectId: string;

    beforeAll(async () => {
      const projectData = generateProjectData();
      const response = await request
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData);
      projectId = response.body.data.id;
    });

    it('should get project by ID as owner', async () => {
      const response = await request
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(projectId);
      expect(response.body.data.userRole).toBe('owner');
    });

    it('should deny access to private project for non-member', async () => {
      const response = await request
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should allow access to public project for any user', async () => {
      // Make project public
      await request
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isPublic: true });

      const response = await request
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userRole).toBe('viewer');
    });
  });

  describe('PATCH /api/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const projectData = generateProjectData();
      const response = await request
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData);
      projectId = response.body.data.id;
    });

    it('should update project as owner', async () => {
      const updates = {
        name: 'Updated Project Name',
        description: 'Updated description',
        isPublic: true,
        highContrastMode: true,
      };

      const response = await request
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(updates);
    });

    it('should deny update for non-member', async () => {
      const response = await request
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ name: 'Hacked Name' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete project as owner', async () => {
      const projectData = generateProjectData();
      const createResponse = await request
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData);
      const projectId = createResponse.body.data.id;

      const response = await request
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify project is deleted
      const getResponse = await request
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(getResponse.body.success).toBe(false);
    });

    it('should deny delete for non-owner', async () => {
      const projectData = generateProjectData();
      const createResponse = await request
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData);
      const projectId = createResponse.body.data.id;

      const response = await request
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/projects', () => {
    beforeAll(async () => {
      // Create multiple projects for testing
      for (let i = 0; i < 5; i++) {
        const projectData = generateProjectData();
        await request
          .post('/api/projects')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ ...projectData, isPublic: i % 2 === 0 });
      }
    });

    it('should list user projects with pagination', async () => {
      const response = await request
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toBeInstanceOf(Array);
      expect(response.body.data.total).toBeGreaterThan(0);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(10);
    });

    it('should filter projects by query', async () => {
      const uniqueProjectData = generateProjectData();
      uniqueProjectData.name = 'UNIQUE_SEARCH_PROJECT';
      await request
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(uniqueProjectData);

      const response = await request
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ query: 'UNIQUE_SEARCH' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects.length).toBeGreaterThan(0);
      expect(response.body.data.projects[0].name).toContain('UNIQUE_SEARCH');
    });

    it('should filter projects by isPublic', async () => {
      const response = await request
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ isPublic: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.projects.forEach((project: any) => {
        expect(project.isPublic).toBe(true);
      });
    });
  });

  describe('Project Members', () => {
    let projectId: string;

    beforeEach(async () => {
      const projectData = generateProjectData();
      const response = await request
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData);
      projectId = response.body.data.id;
    });

    describe('POST /api/projects/:id/members', () => {
      it('should add member to project as owner', async () => {
        const response = await request
          .post(`/api/projects/${projectId}/members`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ userId: secondUserId, role: 'member' })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.userId).toBe(secondUserId);
        expect(response.body.data.role).toBe('member');
      });

      it('should reject duplicate member addition', async () => {
        // Add member once
        await request
          .post(`/api/projects/${projectId}/members`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ userId: secondUserId, role: 'member' });

        // Try to add again
        const response = await request
          .post(`/api/projects/${projectId}/members`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ userId: secondUserId, role: 'admin' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('already a member');
      });

      it('should deny adding member for non-owner', async () => {
        const response = await request
          .post(`/api/projects/${projectId}/members`)
          .set('Authorization', `Bearer ${secondUserToken}`)
          .send({ userId: secondUserId, role: 'member' })
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/projects/:id/members', () => {
      beforeEach(async () => {
        await request
          .post(`/api/projects/${projectId}/members`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ userId: secondUserId, role: 'member' });
      });

      it('should get project members as owner', async () => {
        const response = await request
          .get(`/api/projects/${projectId}/members`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should get project members as member', async () => {
        const response = await request
          .get(`/api/projects/${projectId}/members`)
          .set('Authorization', `Bearer ${secondUserToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('PATCH /api/projects/:id/members/:memberId', () => {
      let memberId: string;

      beforeEach(async () => {
        const addResponse = await request
          .post(`/api/projects/${projectId}/members`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ userId: secondUserId, role: 'member' });
        memberId = addResponse.body.data.id;
      });

      it('should update member role as owner', async () => {
        const response = await request
          .patch(`/api/projects/${projectId}/members/${memberId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ role: 'admin' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.role).toBe('admin');
      });

      it('should deny role update for non-admin', async () => {
        const response = await request
          .patch(`/api/projects/${projectId}/members/${memberId}`)
          .set('Authorization', `Bearer ${secondUserToken}`)
          .send({ role: 'admin' })
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/projects/:id/members/:memberId', () => {
      let memberId: string;

      beforeEach(async () => {
        const addResponse = await request
          .post(`/api/projects/${projectId}/members`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ userId: secondUserId, role: 'member' });
        memberId = addResponse.body.data.id;
      });

      it('should remove member as owner', async () => {
        const response = await request
          .delete(`/api/projects/${projectId}/members/${memberId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);

        // Verify member is removed
        const membersResponse = await request
          .get(`/api/projects/${projectId}/members`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const memberExists = membersResponse.body.data.some((m: any) => m.id === memberId);
        expect(memberExists).toBe(false);
      });

      it('should deny member removal for non-admin', async () => {
        const response = await request
          .delete(`/api/projects/${projectId}/members/${memberId}`)
          .set('Authorization', `Bearer ${secondUserToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Permissions and Access Control', () => {
    let projectId: string;

    beforeEach(async () => {
      const projectData = generateProjectData();
      const response = await request
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData);
      projectId = response.body.data.id;
    });

    it('should allow viewer to read but not edit', async () => {
      // Make project public so second user can view
      await request
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isPublic: true });

      // Should be able to view
      await request
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(200);

      // Should not be able to edit
      await request
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ name: 'Unauthorized Edit' })
        .expect(403);
    });

    it('should allow member to edit but not delete', async () => {
      // Add second user as member
      await request
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId: secondUserId, role: 'member' });

      // Should be able to edit
      await request
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ description: 'Member edited this' })
        .expect(200);

      // Should not be able to delete
      await request
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(403);
    });

    it('should allow admin to manage members', async () => {
      // Add second user as admin
      await request
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId: secondUserId, role: 'admin' });

      // Create third user
      const thirdUser = generateTestUser();
      const thirdUserResponse = await request.post('/api/auth/register').send(thirdUser);
      const thirdUserId = thirdUserResponse.body.data.user.id;

      // Admin should be able to add members
      const response = await request
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ userId: thirdUserId, role: 'viewer' })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });
});
