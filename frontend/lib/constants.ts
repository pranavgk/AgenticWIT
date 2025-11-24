/**
 * Application constants
 */

export const APP_NAME = 'AgenticWIT';
export const APP_DESCRIPTION = 'Enterprise Work Item Tracking System';

/**
 * API Configuration
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Work item types
 */
export const WORK_ITEM_TYPES = {
  EPIC: 'epic',
  FEATURE: 'feature',
  STORY: 'story',
  TASK: 'task',
  BUG: 'bug',
  DEBT: 'debt',
} as const;

/**
 * Work item type colors
 */
export const WORK_ITEM_TYPE_COLORS = {
  epic: '#8b5cf6',
  feature: '#3b82f6',
  story: '#10b981',
  task: '#f59e0b',
  bug: '#ef4444',
  debt: '#6b7280',
} as const;

/**
 * Priority levels
 */
export const PRIORITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

/**
 * Priority colors
 */
export const PRIORITY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#65a30d',
} as const;

/**
 * Work item statuses
 */
export const WORK_ITEM_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  BLOCKED: 'blocked',
} as const;

/**
 * Routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  SETTINGS: '/settings',
} as const;
