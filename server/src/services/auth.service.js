import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Token from '../models/Token.js';
import Organization from '../models/Organization.js';
import OrganizationMember from '../models/OrganizationMember.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
} from '../utils/security.js';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ServiceUnavailableError,
} from '../utils/errors.js';
import { sanitizeUser } from '../utils/helpers.js';
import { isMailConfigured, sendMail } from '../config/mail.js';
import env from '../config/env.js';

const googleOAuthClient = new OAuth2Client();

export class AuthService {
  static async register(userData) {
    const existing = await User.findOne({ email: userData.email.toLowerCase() });
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await hashPassword(userData.password);
    const user = await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email.toLowerCase(),
      passwordHash,
    });

    return sanitizeUser(user);
  }

  static async login({ email, password, userAgent = 'unknown', ipAddress = '' }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.accountStatus !== 'active') {
      throw new UnauthorizedError(`Account is ${user.accountStatus}. Please contact support.`);
    }

    return this.createSessionForUser(user, { userAgent, ipAddress });
  }

  static async loginWithGoogle({ credential, userAgent = 'unknown', ipAddress = '' }) {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new ServiceUnavailableError(
        'Google sign-in is not configured. Set GOOGLE_CLIENT_ID on the server.',
        'GOOGLE_AUTH_NOT_CONFIGURED'
      );
    }

    let payload;
    try {
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (error) {
      const networkErrorCodes = new Set([
        'ECONNRESET',
        'ECONNREFUSED',
        'ENOTFOUND',
        'EAI_AGAIN',
        'ETIMEDOUT',
      ]);

      if (networkErrorCodes.has(error?.code) || error?.response?.status >= 500) {
        throw new ServiceUnavailableError(
          'Google sign-in verification is temporarily unavailable.',
          'GOOGLE_VERIFICATION_UNAVAILABLE'
        );
      }

      throw new UnauthorizedError('Google sign-in credential is invalid.', 'INVALID_GOOGLE_CREDENTIAL');
    }

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new UnauthorizedError(
        'Google account must have a verified email address.',
        'GOOGLE_EMAIL_NOT_VERIFIED'
      );
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.findOne({ email });
    }

    if (user) {
      if (user.googleId && user.googleId !== payload.sub) {
        throw new ConflictError('This email is linked to a different Google account.');
      }
      if (user.accountStatus !== 'active') {
        throw new UnauthorizedError(`Account is ${user.accountStatus}. Please contact support.`);
      }

      user.googleId = payload.sub;
      user.emailVerified = true;
      if (payload.picture) user.avatar = payload.picture;
      await user.save();
    } else {
      const displayName = String(payload.name || email.split('@')[0]).trim();
      const nameParts = displayName.split(/\s+/);
      const firstName = String(payload.given_name || nameParts.shift() || 'Google').slice(0, 50);
      const lastName = String(payload.family_name || nameParts.join(' ') || 'User').slice(0, 50);

      user = await User.create({
        firstName,
        lastName,
        email,
        googleId: payload.sub,
        passwordHash: await hashPassword(crypto.randomBytes(32).toString('base64url')),
        avatar: payload.picture || '',
        emailVerified: true,
      });
    }

    return this.createSessionForUser(user, { userAgent, ipAddress });
  }

  static async createSessionForUser(user, { userAgent = 'unknown', ipAddress = '' } = {}) {
    user.lastLoginAt = new Date();
    await user.save();

    const tokenFamilyId = crypto.randomUUID();
    const accessToken = generateAccessToken({ userId: user._id });
    const refreshToken = generateRefreshToken({ userId: user._id, tokenFamilyId });
    const refreshTokenHash = hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Session.create({
      userId: user._id,
      refreshTokenHash,
      tokenFamilyId,
      userAgent,
      ipAddress,
      expiresAt,
    });

    // Fetch user's organizations
    const memberships = await OrganizationMember.find({ userId: user._id, status: 'active' }).populate('organizationId');
    const organizations = memberships.map((m) => ({
      organization: m.organizationId,
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
      organizations,
    };
  }

  static async refreshTokens({ refreshToken, userAgent = 'unknown', ipAddress = '' }) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const incomingHash = hashToken(refreshToken);
    const session = await Session.findOne({
      userId: decoded.userId,
      tokenFamilyId: decoded.tokenFamilyId,
    });

    if (!session) {
      throw new UnauthorizedError('Session not found or already invalidated');
    }

    // Token reuse detection: If hash doesn't match and was already rotated
    if (session.refreshTokenHash !== incomingHash || session.revokedAt) {
      // Invalidate the entire token family
      await Session.deleteMany({ userId: decoded.userId, tokenFamilyId: decoded.tokenFamilyId });
      throw new UnauthorizedError('Compromised refresh token detected. All associated sessions revoked.');
    }

    // Rotate refresh token
    const newAccessToken = generateAccessToken({ userId: decoded.userId });
    const newRefreshToken = generateRefreshToken({
      userId: decoded.userId,
      tokenFamilyId: decoded.tokenFamilyId,
    });
    const newRefreshTokenHash = hashToken(newRefreshToken);

    session.refreshTokenHash = newRefreshTokenHash;
    session.userAgent = userAgent;
    session.ipAddress = ipAddress;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await session.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout({ refreshToken }) {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await Session.deleteOne({ refreshTokenHash: tokenHash });
  }

  static async logoutAll(userId) {
    await Session.deleteMany({ userId });
  }

  static async forgotPassword(email) {
    if (!isMailConfigured) {
      throw new ServiceUnavailableError(
        'Email delivery is not configured. Password recovery is unavailable.',
        'EMAIL_DELIVERY_NOT_CONFIGURED'
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return true to prevent email enumeration
      return true;
    }

    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);

    await Token.create({
      userId: user._id,
      tokenHash,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your TaskFlow Pro Password',
      text: `Click the link to reset your password: ${resetUrl}`,
      html: `<p>Hello ${user.firstName},</p><p>You requested a password reset. <a href="${resetUrl}">Click here to reset your password</a>.</p><p>This link expires in 1 hour.</p>`,
    });

    return true;
  }

  static async resetPassword({ token, newPassword }) {
    const tokenHash = hashToken(token);
    const record = await Token.findOne({
      tokenHash,
      type: 'password_reset',
      expiresAt: { $gt: new Date() },
      usedAt: null,
    });

    if (!record) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const user = await User.findById(record.userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    record.usedAt = new Date();
    await record.save();

    // Revoke all existing sessions
    await Session.deleteMany({ userId: user._id });

    return true;
  }

  static async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Current password does not match');
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return true;
  }

  static async getSessions(userId) {
    return Session.find({ userId }).sort({ createdAt: -1 });
  }

  static async deleteSession(userId, sessionId) {
    const result = await Session.deleteOne({ _id: sessionId, userId });
    if (result.deletedCount === 0) {
      throw new NotFoundError('Session not found');
    }
  }
}

export default AuthService;
