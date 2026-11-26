import Organization from '../models/Organization.js';
import OrganizationMember from '../models/OrganizationMember.js';
import Invitation from '../models/Invitation.js';
import User from '../models/User.js';
import { ROLES, ACTIVITY_ACTIONS } from '../constants/index.js';
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ServiceUnavailableError,
} from '../utils/errors.js';
import { generateRandomToken, hashToken } from '../utils/security.js';
import { isMailConfigured, sendMail } from '../config/mail.js';
import env from '../config/env.js';
import Activity from '../models/Activity.js';

export class OrganizationService {
  static async createOrganization(ownerId, data) {
    const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const existing = await Organization.findOne({ slug });
    if (existing) {
      throw new ConflictError('Organization with this slug/name already exists');
    }

    const org = await Organization.create({
      name: data.name,
      slug,
      description: data.description || '',
      ownerId,
      industry: data.industry || '',
      teamSize: data.teamSize || '',
      timezone: data.timezone || '',
    });

    // Establish owner as Admin member
    await OrganizationMember.create({
      organizationId: org._id,
      userId: ownerId,
      role: ROLES.ADMIN,
      status: 'active',
    });

    await Activity.create({
      organizationId: org._id,
      actorId: ownerId,
      action: ACTIVITY_ACTIONS.ORG_CREATED,
      entityType: 'organization',
      entityId: org._id,
      newValues: { name: org.name, slug: org.slug },
    });

    return org;
  }

  static async getUserOrganizations(userId) {
    const memberships = await OrganizationMember.find({ userId, status: 'active' })
      .populate('organizationId')
      .sort({ createdAt: -1 });

    return memberships
      .filter((m) => m.organizationId && m.organizationId.status !== 'archived')
      .map((m) => ({
        ...m.organizationId.toObject(),
        role: m.role,
        joinedAt: m.joinedAt,
      }));
  }

  static async getOrganizationById(orgId) {
    const org = await Organization.findById(orgId).populate('ownerId', 'firstName lastName email avatar');
    if (!org || org.status === 'archived') {
      throw new NotFoundError('Organization not found');
    }
    return org;
  }

  static async updateOrganization(orgId, updates, actorId) {
    const allowed = ['name', 'description', 'logo', 'industry', 'teamSize', 'timezone', 'settings'];
    const updatePayload = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) updatePayload[key] = updates[key];
    }

    const org = await Organization.findByIdAndUpdate(orgId, updatePayload, { new: true });
    if (!org) throw new NotFoundError('Organization not found');

    await Activity.create({
      organizationId: orgId,
      actorId,
      action: ACTIVITY_ACTIONS.ORG_CREATED, // or updated
      entityType: 'organization',
      entityId: orgId,
      newValues: updatePayload,
    });

    return org;
  }

  static async archiveOrganization(orgId, actorId) {
    const org = await Organization.findById(orgId);
    if (!org) throw new NotFoundError('Organization not found');

    org.status = 'archived';
    await org.save();
    return org;
  }

  // Members
  static async getMembers(orgId, { search, role, department, page = 1, limit = 50 }) {
    const query = { organizationId: orgId, status: 'active' };
    if (role) query.role = role;
    if (department) query.department = department;

    const skip = (Number(page) - 1) * Number(limit);
    const [members, total] = await Promise.all([
      OrganizationMember.find(query)
        .populate('userId', 'firstName lastName email avatar jobTitle department phone bio')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: 1 }),
      OrganizationMember.countDocuments(query),
    ]);

    let filtered = members;
    if (search) {
      const q = search.toLowerCase();
      filtered = members.filter((m) => {
        const u = m.userId;
        return (
          u &&
          (u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q))
        );
      });
    }

    return {
      members: filtered.map((m) => ({
        id: m._id,
        userId: m.userId?._id,
        name: m.userId ? `${m.userId.firstName} ${m.userId.lastName}` : 'Unknown',
        email: m.userId?.email,
        avatar: m.userId?.avatar,
        jobTitle: m.userId?.jobTitle,
        department: m.department || m.userId?.department,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  static async updateMemberRole(orgId, memberId, newRole, actorId) {
    const member = await OrganizationMember.findOne({ _id: memberId, organizationId: orgId });
    if (!member) throw new NotFoundError('Member not found');

    // Prevent demoting the final admin
    if (member.role === ROLES.ADMIN && newRole !== ROLES.ADMIN) {
      const adminCount = await OrganizationMember.countDocuments({
        organizationId: orgId,
        role: ROLES.ADMIN,
        status: 'active',
      });
      if (adminCount <= 1) {
        throw new BadRequestError('Cannot demote the final administrator of this organization');
      }
    }

    const oldRole = member.role;
    member.role = newRole;
    await member.save();

    await Activity.create({
      organizationId: orgId,
      actorId,
      action: ACTIVITY_ACTIONS.MEMBER_ROLE_CHANGED,
      entityType: 'member',
      entityId: member._id,
      previousValues: { role: oldRole },
      newValues: { role: newRole },
    });

    return member;
  }

  static async removeMember(orgId, memberId, actorId) {
    const member = await OrganizationMember.findOne({ _id: memberId, organizationId: orgId });
    if (!member) throw new NotFoundError('Member not found');

    if (member.role === ROLES.ADMIN) {
      const adminCount = await OrganizationMember.countDocuments({
        organizationId: orgId,
        role: ROLES.ADMIN,
        status: 'active',
      });
      if (adminCount <= 1) {
        throw new BadRequestError('Cannot remove the final administrator of this organization');
      }
    }

    member.status = 'inactive';
    await member.save();

    await Activity.create({
      organizationId: orgId,
      actorId,
      action: ACTIVITY_ACTIONS.MEMBER_REMOVED,
      entityType: 'member',
      entityId: member._id,
    });

    return true;
  }

  // Invitations
  static async inviteMember(orgId, { email, role }, invitedById) {
    if (!isMailConfigured) {
      throw new ServiceUnavailableError(
        'Email delivery is not configured. Member invitations are unavailable.',
        'EMAIL_DELIVERY_NOT_CONFIGURED'
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user is already a member
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const existingMember = await OrganizationMember.findOne({
        organizationId: orgId,
        userId: existingUser._id,
        status: 'active',
      });
      if (existingMember) {
        throw new ConflictError('User is already an active member of this organization');
      }
    }

    // Cancel previous pending invitation
    await Invitation.deleteMany({ organizationId: orgId, email: normalizedEmail });

    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await Invitation.create({
      organizationId: orgId,
      email: normalizedEmail,
      role,
      invitedBy: invitedById,
      tokenHash,
      expiresAt,
    });

    const org = await Organization.findById(orgId);
    const inviteUrl = `${env.CLIENT_URL}/invite/accept?token=${rawToken}`;

    await sendMail({
      to: normalizedEmail,
      subject: `You've been invited to join ${org.name} on TaskFlow Pro`,
      text: `Join ${org.name} on TaskFlow Pro: ${inviteUrl}`,
      html: `<p>Hello,</p><p>You have been invited to join <strong>${org.name}</strong> on TaskFlow Pro as a <strong>${role}</strong>.</p><p><a href="${inviteUrl}">Click here to accept the invitation</a>.</p>`,
    });

    return invitation;
  }

  static async acceptInvitation(rawToken, userId) {
    const tokenHash = hashToken(rawToken);
    const invitation = await Invitation.findOne({
      tokenHash,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      throw new BadRequestError('Invalid or expired invitation token');
    }

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const member = await OrganizationMember.findOneAndUpdate(
      { organizationId: invitation.organizationId, userId: user._id },
      {
        role: invitation.role,
        department: user.department || '',
        status: 'active',
        joinedAt: new Date(),
        invitedBy: invitation.invitedBy,
      },
      { upsert: true, new: true }
    );

    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    await Activity.create({
      organizationId: invitation.organizationId,
      actorId: user._id,
      action: ACTIVITY_ACTIONS.MEMBER_JOINED,
      entityType: 'member',
      entityId: member._id,
    });

    return member;
  }

  static async getInvitations(orgId) {
    return Invitation.find({ organizationId: orgId, status: 'pending' }).sort({ createdAt: -1 });
  }

  static async cancelInvitation(orgId, invitationId) {
    const result = await Invitation.deleteOne({ _id: invitationId, organizationId: orgId });
    if (result.deletedCount === 0) throw new NotFoundError('Invitation not found');
    return true;
  }
}

export default OrganizationService;
