import OrganizationService from '../services/organization.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export class OrganizationController {
  static async create(req, res, next) {
    try {
      const org = await OrganizationService.createOrganization(req.user._id, req.body);
      return sendSuccess(res, 'Organization created successfully', { organization: org }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async listUserOrganizations(req, res, next) {
    try {
      const organizations = await OrganizationService.getUserOrganizations(req.user._id);
      return sendSuccess(res, 'Organizations retrieved', { organizations });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const org = await OrganizationService.getOrganizationById(req.params.organizationId);
      return sendSuccess(res, 'Organization details retrieved', { organization: org });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const org = await OrganizationService.updateOrganization(req.params.organizationId, req.body, req.user._id);
      return sendSuccess(res, 'Organization updated successfully', { organization: org });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await OrganizationService.archiveOrganization(req.params.organizationId, req.user._id);
      return sendSuccess(res, 'Organization archived successfully');
    } catch (error) {
      next(error);
    }
  }

  // Members
  static async getMembers(req, res, next) {
    try {
      const result = await OrganizationService.getMembers(req.params.organizationId, req.query);
      return sendPaginated(res, result.members, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }, 'Members retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateMemberRole(req, res, next) {
    try {
      const member = await OrganizationService.updateMemberRole(
        req.params.organizationId,
        req.params.memberId,
        req.body.role,
        req.user._id
      );
      return sendSuccess(res, 'Member role updated', { member });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req, res, next) {
    try {
      await OrganizationService.removeMember(req.params.organizationId, req.params.memberId, req.user._id);
      return sendSuccess(res, 'Member removed successfully');
    } catch (error) {
      next(error);
    }
  }

  // Invitations
  static async inviteMember(req, res, next) {
    try {
      const invitation = await OrganizationService.inviteMember(req.params.organizationId, req.body, req.user._id);
      return sendSuccess(res, 'Invitation sent successfully', { invitation }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getInvitations(req, res, next) {
    try {
      const invitations = await OrganizationService.getInvitations(req.params.organizationId);
      return sendSuccess(res, 'Pending invitations retrieved', { invitations });
    } catch (error) {
      next(error);
    }
  }

  static async cancelInvitation(req, res, next) {
    try {
      await OrganizationService.cancelInvitation(req.params.organizationId, req.params.invitationId);
      return sendSuccess(res, 'Invitation cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  static async acceptInvitation(req, res, next) {
    try {
      const member = await OrganizationService.acceptInvitation(req.body.token, req.user._id);
      return sendSuccess(res, 'Invitation accepted successfully', { member });
    } catch (error) {
      next(error);
    }
  }
}

export default OrganizationController;
