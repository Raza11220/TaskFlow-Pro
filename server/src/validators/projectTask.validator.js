import { z } from 'zod';
import { TASK_STATUSES, TASK_PRIORITIES, PROJECT_STATUSES, CYCLE_STATUSES } from '../constants/index.js';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Project name is required').max(100),
    key: z.string().min(2, 'Key must be at least 2 characters').max(10).toUpperCase(),
    description: z.string().max(1000).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    leadId: z.string().optional(),
    memberIds: z.array(z.string()).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(1000).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    leadId: z.string().optional(),
    memberIds: z.array(z.string()).optional(),
    status: z.enum(Object.values(PROJECT_STATUSES)).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'projectId is required'),
    title: z.string().min(1, 'Task title is required').max(250),
    description: z.string().optional(),
    status: z.enum(Object.values(TASK_STATUSES)).optional(),
    priority: z.enum(Object.values(TASK_PRIORITIES)).optional(),
    assigneeIds: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    cycleId: z.string().optional(),
    parentTaskId: z.string().optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    estimatedMinutes: z.number().optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(TASK_STATUSES)),
  }),
});

export const moveTaskSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(TASK_STATUSES)),
    position: z.number(),
  }),
});

export const createCycleSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'projectId is required'),
    name: z.string().min(1, 'Cycle name is required').max(100),
    description: z.string().optional(),
    goal: z.string().optional(),
    startDate: z.string().min(1, 'startDate is required'),
    endDate: z.string().min(1, 'endDate is required'),
  }),
});

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment content cannot be empty'),
    mentionedUserIds: z.array(z.string()).optional(),
    parentCommentId: z.string().optional(),
  }),
});
