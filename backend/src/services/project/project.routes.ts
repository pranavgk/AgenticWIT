import { FastifyInstance } from 'fastify';
import * as projectController from './project.controller';
import { authenticate } from '../../middleware/auth.middleware';

/**
 * Register project management routes with OpenAPI documentation
 */
export async function projectRoutes(fastify: FastifyInstance) {
  // Create project
  fastify.post('/api/projects', {
    schema: {
      tags: ['Projects'],
      summary: 'Create a new project',
      description: 'Create a new project with accessibility metadata and team support',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'key'],
        properties: {
          name: { 
            type: 'string', 
            minLength: 3, 
            maxLength: 100,
            description: 'Project name' 
          },
          key: { 
            type: 'string', 
            minLength: 2, 
            maxLength: 10,
            pattern: '^[A-Z][A-Z0-9]*$',
            description: 'Unique project key (uppercase letters and numbers only, e.g., "PROJ", "TEST123")' 
          },
          description: { 
            type: 'string', 
            maxLength: 1000,
            description: 'Project description' 
          },
          isPublic: { 
            type: 'boolean', 
            default: false,
            description: 'Whether the project is publicly accessible' 
          },
          accessibilityLevel: { 
            type: 'string', 
            enum: ['A', 'AA', 'AAA'],
            default: 'AA',
            description: 'WCAG accessibility level' 
          },
          highContrastMode: { 
            type: 'boolean', 
            default: false,
            description: 'Enable high contrast mode for the project' 
          },
          screenReaderOptimized: { 
            type: 'boolean', 
            default: false,
            description: 'Enable screen reader optimizations' 
          },
        },
      },
      response: {
        201: {
          description: 'Project created successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                key: { type: 'string' },
                description: { type: 'string' },
                isPublic: { type: 'boolean' },
                isArchived: { type: 'boolean' },
                accessibilityLevel: { type: 'string' },
                highContrastMode: { type: 'boolean' },
                screenReaderOptimized: { type: 'boolean' },
                ownerId: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        400: {
          description: 'Validation error or project key already exists',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: authenticate,
    handler: projectController.createProject,
  });

  // Get project by ID
  fastify.get('/api/projects/:id', {
    schema: {
      tags: ['Projects'],
      summary: 'Get project by ID',
      description: 'Retrieve a project by its ID with user-specific access information',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Project ID' },
        },
      },
      response: {
        200: {
          description: 'Project retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
        403: {
          description: 'Access denied',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
        404: {
          description: 'Project not found',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: authenticate,
    handler: projectController.getProject,
  });

  // Update project
  fastify.patch('/api/projects/:id', {
    schema: {
      tags: ['Projects'],
      summary: 'Update project',
      description: 'Update project information (requires edit permission)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Project ID' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100 },
          description: { type: 'string', maxLength: 1000 },
          isPublic: { type: 'boolean' },
          isArchived: { type: 'boolean' },
          accessibilityLevel: { type: 'string', enum: ['A', 'AA', 'AAA'] },
          highContrastMode: { type: 'boolean' },
          screenReaderOptimized: { type: 'boolean' },
        },
      },
      response: {
        200: {
          description: 'Project updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
        403: {
          description: 'Permission denied',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: authenticate,
    handler: projectController.updateProject,
  });

  // Delete project
  fastify.delete('/api/projects/:id', {
    schema: {
      tags: ['Projects'],
      summary: 'Delete project',
      description: 'Delete a project (requires owner role)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Project ID' },
        },
      },
      response: {
        200: {
          description: 'Project deleted successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        403: {
          description: 'Permission denied',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: authenticate,
    handler: projectController.deleteProject,
  });

  // Search/list projects
  fastify.get('/api/projects', {
    schema: {
      tags: ['Projects'],
      summary: 'Search and list projects',
      description: 'Search and filter projects accessible to the current user',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query for name, key, or description' },
          isPublic: { type: 'boolean', description: 'Filter by public/private status' },
          isArchived: { type: 'boolean', description: 'Filter by archived status' },
          ownerId: { type: 'string', format: 'uuid', description: 'Filter by owner ID' },
          page: { type: 'number', minimum: 1, default: 1, description: 'Page number' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20, description: 'Items per page' },
        },
      },
      response: {
        200: {
          description: 'Projects retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                projects: { type: 'array' },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
              },
            },
          },
        },
      },
    },
    preHandler: authenticate,
    handler: projectController.searchProjects,
  });

  // Add member to project
  fastify.post('/api/projects/:id/members', {
    schema: {
      tags: ['Project Members'],
      summary: 'Add member to project',
      description: 'Add a new member to the project (requires manage_members permission)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Project ID' },
        },
      },
      body: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', format: 'uuid', description: 'User ID to add' },
          role: { 
            type: 'string', 
            enum: ['admin', 'member', 'viewer'],
            default: 'member',
            description: 'Member role' 
          },
        },
      },
      response: {
        201: {
          description: 'Member added successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
        403: {
          description: 'Permission denied',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: authenticate,
    handler: projectController.addMember,
  });

  // Get project members
  fastify.get('/api/projects/:id/members', {
    schema: {
      tags: ['Project Members'],
      summary: 'Get project members',
      description: 'List all members of a project',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Project ID' },
        },
      },
      response: {
        200: {
          description: 'Members retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
          },
        },
        403: {
          description: 'Permission denied',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: authenticate,
    handler: projectController.getMembers,
  });

  // Update member role
  fastify.patch('/api/projects/:id/members/:memberId', {
    schema: {
      tags: ['Project Members'],
      summary: 'Update member role',
      description: 'Update a member\'s role in the project (requires manage_members permission)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Project ID' },
          memberId: { type: 'string', format: 'uuid', description: 'Member ID' },
        },
      },
      body: {
        type: 'object',
        required: ['role'],
        properties: {
          role: { 
            type: 'string', 
            enum: ['admin', 'member', 'viewer'],
            description: 'New member role' 
          },
        },
      },
      response: {
        200: {
          description: 'Member updated successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
        403: {
          description: 'Permission denied',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: authenticate,
    handler: projectController.updateMember,
  });

  // Remove member from project
  fastify.delete('/api/projects/:id/members/:memberId', {
    schema: {
      tags: ['Project Members'],
      summary: 'Remove member from project',
      description: 'Remove a member from the project (requires manage_members permission)',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Project ID' },
          memberId: { type: 'string', format: 'uuid', description: 'Member ID' },
        },
      },
      response: {
        200: {
          description: 'Member removed successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        403: {
          description: 'Permission denied',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: authenticate,
    handler: projectController.removeMember,
  });
}
