import { PrismaClient } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import {
  CreateProjectInput,
  UpdateProjectInput,
  AddMemberInput,
  UpdateMemberInput,
  ProjectSearchInput,
  ProjectResponse,
  ProjectMemberResponse,
  ProjectListResponse,
} from './project.types';

const prisma = new PrismaClient();

/**
 * Format project response with optional relations
 */
function formatProjectResponse(project: any, userRole?: string): ProjectResponse {
  return {
    id: project.id,
    name: project.name,
    key: project.key,
    description: project.description,
    isPublic: project.isPublic,
    isArchived: project.isArchived,
    accessibilityLevel: project.accessibilityLevel,
    highContrastMode: project.highContrastMode,
    screenReaderOptimized: project.screenReaderOptimized,
    ownerId: project.ownerId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    owner: project.owner
      ? {
          id: project.owner.id,
          username: project.owner.username,
          firstName: project.owner.firstName,
          lastName: project.owner.lastName,
        }
      : undefined,
    memberCount: project._count?.members,
    userRole,
  };
}

/**
 * Check if user has access to a project
 */
async function checkProjectAccess(
  projectId: string,
  userId: string
): Promise<{ hasAccess: boolean; role?: string; isOwner: boolean }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId },
      },
    },
  });

  if (!project) {
    return { hasAccess: false, isOwner: false };
  }

  const isOwner = project.ownerId === userId;
  const member = project.members[0];

  // Owner has access
  if (isOwner) {
    return { hasAccess: true, role: 'owner', isOwner: true };
  }

  // Member has access
  if (member) {
    return { hasAccess: true, role: member.role, isOwner: false };
  }

  // Public project - anyone can view
  if (project.isPublic) {
    return { hasAccess: true, role: 'viewer', isOwner: false };
  }

  return { hasAccess: false, isOwner: false };
}

/**
 * Check if user has permission for an action
 */
function hasPermission(role: string | undefined, action: 'view' | 'edit' | 'delete' | 'manage_members'): boolean {
  if (!role) return false;

  const permissions = {
    owner: ['view', 'edit', 'delete', 'manage_members'],
    admin: ['view', 'edit', 'manage_members'],
    member: ['view', 'edit'],
    viewer: ['view'],
  };

  return permissions[role as keyof typeof permissions]?.includes(action) || false;
}

/**
 * Create a new project
 */
export async function createProject(
  request: FastifyRequest,
  userId: string,
  data: CreateProjectInput
): Promise<ProjectResponse> {
  // Check if project key already exists
  const existingProject = await prisma.project.findUnique({
    where: { key: data.key },
  });

  if (existingProject) {
    throw new Error('Project key already exists');
  }

  // Create project
  const project = await prisma.project.create({
    data: {
      ...data,
      ownerId: userId,
    },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: { members: true },
      },
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'PROJECT_CREATED',
      resource: 'project',
      details: { projectId: project.id, projectKey: project.key },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    },
  });

  return formatProjectResponse(project, 'owner');
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string, userId: string): Promise<ProjectResponse> {
  const access = await checkProjectAccess(projectId, userId);

  if (!access.hasAccess) {
    throw new Error('Project not found or access denied');
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: { members: true },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return formatProjectResponse(project, access.role);
}

/**
 * Update project
 */
export async function updateProject(
  request: FastifyRequest,
  projectId: string,
  userId: string,
  data: UpdateProjectInput
): Promise<ProjectResponse> {
  const access = await checkProjectAccess(projectId, userId);

  if (!access.hasAccess || !hasPermission(access.role, 'edit')) {
    throw new Error('Permission denied');
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: { members: true },
      },
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'PROJECT_UPDATED',
      resource: 'project',
      details: { projectId, changes: data },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    },
  });

  return formatProjectResponse(project, access.role);
}

/**
 * Delete project
 */
export async function deleteProject(
  request: FastifyRequest,
  projectId: string,
  userId: string
): Promise<void> {
  const access = await checkProjectAccess(projectId, userId);

  if (!access.hasAccess || !hasPermission(access.role, 'delete')) {
    throw new Error('Permission denied');
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'PROJECT_DELETED',
      resource: 'project',
      details: { projectId },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    },
  });
}

/**
 * Search/list projects
 */
export async function searchProjects(userId: string, filters: ProjectSearchInput): Promise<ProjectListResponse> {
  const { query, isPublic, isArchived, ownerId, page, limit } = filters;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    OR: [
      { ownerId: userId }, // Projects user owns
      { members: { some: { userId } } }, // Projects user is a member of
      { isPublic: true }, // Public projects
    ],
  };

  if (query) {
    where.AND = [
      {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { key: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
    ];
  }

  if (typeof isPublic === 'boolean') {
    where.isPublic = isPublic;
  }

  if (typeof isArchived === 'boolean') {
    where.isArchived = isArchived;
  }

  if (ownerId) {
    where.ownerId = ownerId;
  }

  // Get projects
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        members: {
          where: { userId },
          select: { role: true },
        },
        _count: {
          select: { members: true },
        },
      },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects: projects.map((p) => {
      const userRole = p.ownerId === userId ? 'owner' : p.members[0]?.role || (p.isPublic ? 'viewer' : undefined);
      return formatProjectResponse(p, userRole);
    }),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Add member to project
 */
export async function addProjectMember(
  request: FastifyRequest,
  projectId: string,
  userId: string,
  data: AddMemberInput
): Promise<ProjectMemberResponse> {
  const access = await checkProjectAccess(projectId, userId);

  if (!access.hasAccess || !hasPermission(access.role, 'manage_members')) {
    throw new Error('Permission denied');
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if already a member
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: data.userId,
      },
    },
  });

  if (existingMember) {
    throw new Error('User is already a member of this project');
  }

  // Add member
  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId: data.userId,
      role: data.role,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'PROJECT_MEMBER_ADDED',
      resource: 'project',
      details: { projectId, newMemberId: data.userId, role: data.role },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    },
  });

  return member;
}

/**
 * Get project members
 */
export async function getProjectMembers(projectId: string, userId: string): Promise<ProjectMemberResponse[]> {
  const access = await checkProjectAccess(projectId, userId);

  if (!access.hasAccess) {
    throw new Error('Permission denied');
  }

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return members;
}

/**
 * Update member role
 */
export async function updateProjectMember(
  request: FastifyRequest,
  projectId: string,
  memberId: string,
  userId: string,
  data: UpdateMemberInput
): Promise<ProjectMemberResponse> {
  const access = await checkProjectAccess(projectId, userId);

  if (!access.hasAccess || !hasPermission(access.role, 'manage_members')) {
    throw new Error('Permission denied');
  }

  const member = await prisma.projectMember.update({
    where: { id: memberId },
    data: { role: data.role },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'PROJECT_MEMBER_UPDATED',
      resource: 'project',
      details: { projectId, memberId, newRole: data.role },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    },
  });

  return member;
}

/**
 * Remove member from project
 */
export async function removeProjectMember(
  request: FastifyRequest,
  projectId: string,
  memberId: string,
  userId: string
): Promise<void> {
  const access = await checkProjectAccess(projectId, userId);

  if (!access.hasAccess || !hasPermission(access.role, 'manage_members')) {
    throw new Error('Permission denied');
  }

  await prisma.projectMember.delete({
    where: { id: memberId },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'PROJECT_MEMBER_REMOVED',
      resource: 'project',
      details: { projectId, memberId },
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    },
  });
}
