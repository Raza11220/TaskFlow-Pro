import { verifyAccessToken } from '../utils/security.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import User from '../models/User.js';
import OrganizationMember from '../models/OrganizationMember.js';
import Organization from '../models/Organization.js';
import { ROLE_PERMISSIONS } from '../constants/index.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token is missing');
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('User associated with this token no longer exists');
    }

    if (user.accountStatus !== 'active') {
      throw new ForbiddenError(`Your account is currently ${user.accountStatus}`);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireOrganizationMembership = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId || req.headers['x-organization-id'] || req.body.organizationId || req.query.organizationId;

    if (!organizationId) {
      throw new ForbiddenError('Organization context is required');
    }

    const org = await Organization.findById(organizationId);
    if (!org || org.status === 'archived') {
      throw new ForbiddenError('Organization does not exist or has been archived');
    }

    const membership = await OrganizationMember.findOne({
      organizationId,
      userId: req.user._id,
      status: 'active',
    });

    if (!membership) {
      throw new ForbiddenError('You are not an active member of this organization');
    }

    req.organization = org;
    req.membership = membership;
    req.userRole = membership.role;
    next();
  } catch (error) {
    next(error);
  }
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.membership) {
      return next(new ForbiddenError('Organization membership context is required'));
    }

    const allowedPermissions = ROLE_PERMISSIONS[req.membership.role] || [];
    if (!allowedPermissions.includes(permission)) {
      return next(new ForbiddenError(`Forbidden: Missing required permission '${permission}'`));
    }

    next();
  };
};

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.membership) {
      return next(new ForbiddenError('Organization membership context is required'));
    }

    if (!roles.includes(req.membership.role)) {
      return next(new ForbiddenError(`Forbidden: Role must be one of [${roles.join(', ')}]`));
    }

    next();
  };
};
