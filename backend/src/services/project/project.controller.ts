import { FastifyRequest, FastifyReply } from 'fastify';
import * as projectService from './project.service';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberSchema,
  projectSearchSchema,
} from './project.types';

/**
 * Create a new project
 */
export async function createProject(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.currentUser as any).userId;
    const data = createProjectSchema.parse(request.body);
    const project = await projectService.createProject(request, userId, data);

    reply.status(201).send({
      success: true,
      data: project,
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
      error: error.message || 'Failed to create project',
    });
  }
}

/**
 * Get project by ID
 */
export async function getProject(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.currentUser as any).userId;
    const { id } = request.params as { id: string };
    const project = await projectService.getProjectById(id, userId);

    reply.status(200).send({
      success: true,
      data: project,
    });
  } catch (error: any) {
    reply.status(error.message.includes('not found') ? 404 : 403).send({
      success: false,
      error: error.message || 'Failed to get project',
    });
  }
}

/**
 * Update project
 */
export async function updateProject(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.currentUser as any).userId;
    const { id } = request.params as { id: string };
    const data = updateProjectSchema.parse(request.body);
    const project = await projectService.updateProject(request, id, userId, data);

    reply.status(200).send({
      success: true,
      data: project,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    reply.status(error.message.includes('Permission denied') ? 403 : 400).send({
      success: false,
      error: error.message || 'Failed to update project',
    });
  }
}

/**
 * Delete project
 */
export async function deleteProject(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.currentUser as any).userId;
    const { id } = request.params as { id: string };
    await projectService.deleteProject(request, id, userId);

    reply.status(200).send({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    reply.status(error.message.includes('Permission denied') ? 403 : 400).send({
      success: false,
      error: error.message || 'Failed to delete project',
    });
  }
}

/**
 * Search/list projects
 */
export async function searchProjects(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.currentUser as any).userId;
    const filters = projectSearchSchema.parse(request.query);
    const result = await projectService.searchProjects(userId, filters);

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

    reply.status(400).send({
      success: false,
      error: error.message || 'Failed to search projects',
    });
  }
}

/**
 * Add member to project
 */
export async function addMember(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.currentUser as any).userId;
    const { id } = request.params as { id: string };
    const data = addMemberSchema.parse(request.body);
    const member = await projectService.addProjectMember(request, id, userId, data);

    reply.status(201).send({
      success: true,
      data: member,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    reply.status(error.message.includes('Permission denied') ? 403 : 400).send({
      success: false,
      error: error.message || 'Failed to add member',
    });
  }
}

/**
 * Get project members
 */
export async function getMembers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.currentUser as any).userId;
    const { id } = request.params as { id: string };
    const members = await projectService.getProjectMembers(id, userId);

    reply.status(200).send({
      success: true,
      data: members,
    });
  } catch (error: any) {
    reply.status(error.message.includes('Permission denied') ? 403 : 400).send({
      success: false,
      error: error.message || 'Failed to get members',
    });
  }
}

/**
 * Update member role
 */
export async function updateMember(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.currentUser as any).userId;
    const { id, memberId } = request.params as { id: string; memberId: string };
    const data = updateMemberSchema.parse(request.body);
    const member = await projectService.updateProjectMember(request, id, memberId, userId, data);

    reply.status(200).send({
      success: true,
      data: member,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    }

    reply.status(error.message.includes('Permission denied') ? 403 : 400).send({
      success: false,
      error: error.message || 'Failed to update member',
    });
  }
}

/**
 * Remove member from project
 */
export async function removeMember(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.currentUser as any).userId;
    const { id, memberId } = request.params as { id: string; memberId: string };
    await projectService.removeProjectMember(request, id, memberId, userId);

    reply.status(200).send({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error: any) {
    reply.status(error.message.includes('Permission denied') ? 403 : 400).send({
      success: false,
      error: error.message || 'Failed to remove member',
    });
  }
}
