export const ROLES = {
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  EMPLOYEE: 'employee',
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.PROJECT_MANAGER]: 2,
  [ROLES.EMPLOYEE]: 1,
};

export const PERMISSIONS = {
  // Organization
  ORG_MANAGE_SETTINGS: 'org:manage_settings',
  ORG_INVITE_MEMBERS: 'org:invite_members',
  ORG_MANAGE_ROLES: 'org:manage_roles',
  ORG_REMOVE_MEMBERS: 'org:remove_members',
  ORG_VIEW_ANALYTICS: 'org:view_analytics',

  // Projects
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  PROJECT_ARCHIVE: 'project:archive',
  PROJECT_MANAGE_MEMBERS: 'project:manage_members',
  PROJECT_VIEW_REPORTS: 'project:view_reports',

  // Tasks
  TASK_CREATE: 'task:create',
  TASK_EDIT: 'task:edit',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',
  TASK_UPDATE_STATUS: 'task:update_status',
  TASK_REVIEW_COMPLETE: 'task:review_complete',

  // Cycles
  CYCLE_MANAGE: 'cycle:manage',

  // Comments & Discussions
  COMMENT_CREATE: 'comment:create',
  COMMENT_DELETE: 'comment:delete',

  // Files
  FILE_UPLOAD: 'file:upload',
  FILE_DELETE: 'file:delete',
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.PROJECT_MANAGER]: [
    PERMISSIONS.ORG_VIEW_ANALYTICS,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.PROJECT_ARCHIVE,
    PERMISSIONS.PROJECT_MANAGE_MEMBERS,
    PERMISSIONS.PROJECT_VIEW_REPORTS,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.TASK_UPDATE_STATUS,
    PERMISSIONS.TASK_REVIEW_COMPLETE,
    PERMISSIONS.CYCLE_MANAGE,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_DELETE,
    PERMISSIONS.FILE_UPLOAD,
    PERMISSIONS.FILE_DELETE,
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.TASK_UPDATE_STATUS,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.FILE_UPLOAD,
  ],
};

export const TASK_STATUSES = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
  CANCELLED: 'cancelled',
};

export const VALID_STATUS_TRANSITIONS = {
  [TASK_STATUSES.BACKLOG]: [TASK_STATUSES.TODO, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.TODO]: [TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.BACKLOG, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.IN_PROGRESS]: [TASK_STATUSES.REVIEW, TASK_STATUSES.TODO, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.REVIEW]: [TASK_STATUSES.DONE, TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.DONE]: [TASK_STATUSES.TODO, TASK_STATUSES.REVIEW],
  [TASK_STATUSES.CANCELLED]: [TASK_STATUSES.BACKLOG, TASK_STATUSES.TODO],
};

export const TASK_PRIORITIES = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NONE: 'none',
};

export const PROJECT_STATUSES = {
  PLANNED: 'planned',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const CYCLE_STATUSES = {
  PLANNED: 'planned',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const CONVERSATION_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
  CHANNEL: 'channel',
};

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_STATUS_CHANGED: 'task_status_changed',
  TASK_MENTION: 'task_mention',
  COMMENT_ADDED: 'comment_added',
  DEADLINE_APPROACHING: 'deadline_approaching',
  TASK_OVERDUE: 'task_overdue',
  PROJECT_UPDATED: 'project_updated',
  ORG_INVITATION: 'org_invitation',
  CYCLE_COMPLETED: 'cycle_completed',
  MESSAGE_RECEIVED: 'message_received',
};

export const ACTIVITY_ACTIONS = {
  ORG_CREATED: 'org_created',
  MEMBER_INVITED: 'member_invited',
  MEMBER_JOINED: 'member_joined',
  MEMBER_ROLE_CHANGED: 'member_role_changed',
  MEMBER_REMOVED: 'member_removed',
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_ARCHIVED: 'project_archived',
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_ASSIGNED: 'task_assigned',
  TASK_MOVED: 'task_moved',
  TASK_COMPLETED: 'task_completed',
  TASK_REOPENED: 'task_reopened',
  COMMENT_ADDED: 'comment_added',
  FILE_UPLOADED: 'file_uploaded',
  CYCLE_STARTED: 'cycle_started',
  CYCLE_COMPLETED: 'cycle_completed',
};
