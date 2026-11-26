import { Router } from 'express';
import OrganizationController from '../controllers/organization.controller.js';
import { authenticate, requireOrganizationMembership, requirePermission } from '../middleware/auth.js';
import validateRequest from '../middleware/validate.js';
import {
  createOrganizationSchema,
  inviteMemberSchema,
  acceptInvitationSchema,
} from '../validators/auth.validator.js';
import { PERMISSIONS } from '../constants/index.js';

const router = Router();

// General organization endpoints
router.post('/', authenticate, validateRequest(createOrganizationSchema), OrganizationController.create);
router.get('/', authenticate, OrganizationController.listUserOrganizations);
router.post('/invitations/accept', authenticate, validateRequest(acceptInvitationSchema), OrganizationController.acceptInvitation);

// Org-scoped endpoints
router.get('/:organizationId', authenticate, requireOrganizationMembership, OrganizationController.getById);
router.patch(
  '/:organizationId',
  authenticate,
  requireOrganizationMembership,
  requirePermission(PERMISSIONS.ORG_MANAGE_SETTINGS),
  OrganizationController.update
);
router.delete(
  '/:organizationId',
  authenticate,
  requireOrganizationMembership,
  requirePermission(PERMISSIONS.ORG_MANAGE_SETTINGS),
  OrganizationController.delete
);

// Members
router.get('/:organizationId/members', authenticate, requireOrganizationMembership, OrganizationController.getMembers);
router.patch(
  '/:organizationId/members/:memberId/role',
  authenticate,
  requireOrganizationMembership,
  requirePermission(PERMISSIONS.ORG_MANAGE_ROLES),
  OrganizationController.updateMemberRole
);
router.delete(
  '/:organizationId/members/:memberId',
  authenticate,
  requireOrganizationMembership,
  requirePermission(PERMISSIONS.ORG_REMOVE_MEMBERS),
  OrganizationController.removeMember
);

// Invitations
router.post(
  '/:organizationId/invitations',
  authenticate,
  requireOrganizationMembership,
  requirePermission(PERMISSIONS.ORG_INVITE_MEMBERS),
  validateRequest(inviteMemberSchema),
  OrganizationController.inviteMember
);
router.get(
  '/:organizationId/invitations',
  authenticate,
  requireOrganizationMembership,
  requirePermission(PERMISSIONS.ORG_INVITE_MEMBERS),
  OrganizationController.getInvitations
);
router.delete(
  '/:organizationId/invitations/:invitationId',
  authenticate,
  requireOrganizationMembership,
  requirePermission(PERMISSIONS.ORG_INVITE_MEMBERS),
  OrganizationController.cancelInvitation
);

export default router;
