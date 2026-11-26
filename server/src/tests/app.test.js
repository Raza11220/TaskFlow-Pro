import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, generateAccessToken, verifyAccessToken, hashToken } from '../utils/security.js';
import { registerSchema, loginSchema, googleLoginSchema } from '../validators/auth.validator.js';
import { createTaskSchema, createProjectSchema } from '../validators/projectTask.validator.js';
import { ROLES, TASK_STATUSES, VALID_STATUS_TRANSITIONS } from '../constants/index.js';

describe('TaskFlow Pro Core Business Logic & Security Suite', () => {
  describe('Password Hashing & Token Verification', () => {
    it('hashes passwords securely with bcrypt and verifies matches', async () => {
      const rawPassword = 'SecurePassword123!';
      const hash = await hashPassword(rawPassword);

      expect(hash).not.toBe(rawPassword);
      expect(hash.startsWith('$2')).toBe(true);

      const isMatch = await comparePassword(rawPassword, hash);
      expect(isMatch).toBe(true);

      const isWrong = await comparePassword('WrongPassword', hash);
      expect(isWrong).toBe(false);
    });

    it('generates and verifies valid JWT access tokens', () => {
      const payload = { userId: 'user-12345' };
      const token = generateAccessToken(payload);

      expect(typeof token).toBe('string');
      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe('user-12345');
    });

    it('hashes tokens deterministically with SHA-256 for refresh token storage', () => {
      const token = 'sample-refresh-token';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
    });
  });

  describe('Zod Request Validation Schemas', () => {
    it('validates correct registration payload', () => {
      const result = registerSchema.safeParse({
        body: {
          firstName: 'Fatima',
          lastName: 'Siddiqui',
          email: 'fatima@example.com',
          password: 'Password123!',
          jobTitle: 'Senior Frontend Engineer',
        },
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email and weak password', () => {
      const result = registerSchema.safeParse({
        body: {
          firstName: 'Fatima',
          lastName: 'Siddiqui',
          email: 'not-an-email',
          password: '123',
        },
      });
      expect(result.success).toBe(false);
    });

    it('requires a Google credential for OAuth login', () => {
      expect(googleLoginSchema.safeParse({ body: { credential: 'signed-id-token' } }).success).toBe(true);
      expect(googleLoginSchema.safeParse({ body: {} }).success).toBe(false);
    });

    it('validates project key constraints (uppercase, min 2 chars)', () => {
      const valid = createProjectSchema.safeParse({
        body: {
          name: 'Medico Healthcare Platform',
          key: 'MED',
        },
      });
      expect(valid.success).toBe(true);

      const invalid = createProjectSchema.safeParse({
        body: {
          name: 'M',
          key: '1',
        },
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('Status Transitions & RBAC Matrix', () => {
    it('enforces allowed task status workflow transitions', () => {
      expect(VALID_STATUS_TRANSITIONS[TASK_STATUSES.BACKLOG]).toContain(TASK_STATUSES.TODO);
      expect(VALID_STATUS_TRANSITIONS[TASK_STATUSES.TODO]).toContain(TASK_STATUSES.IN_PROGRESS);
      expect(VALID_STATUS_TRANSITIONS[TASK_STATUSES.IN_PROGRESS]).toContain(TASK_STATUSES.REVIEW);
      expect(VALID_STATUS_TRANSITIONS[TASK_STATUSES.REVIEW]).toContain(TASK_STATUSES.DONE);
    });

    it('defines role hierarchy correctly', () => {
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROLES.PROJECT_MANAGER).toBe('project_manager');
      expect(ROLES.EMPLOYEE).toBe('employee');
    });
  });
});
