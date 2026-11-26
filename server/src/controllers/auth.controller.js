import AuthService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { sanitizeUser } from '../utils/helpers.js';
import env from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
};
const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie('accessToken', accessToken, COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
};

export class AuthController {
  static async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);
      return sendSuccess(res, 'Account registered successfully', { user }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const userAgent = req.headers['user-agent'] || 'unknown';
      const ipAddress = req.ip || req.connection?.remoteAddress || '';
      const result = await AuthService.login({
        email: req.body.email,
        password: req.body.password,
        userAgent,
        ipAddress,
      });

      setAuthCookies(res, result);

      return sendSuccess(res, 'Logged in successfully', {
        user: result.user,
        accessToken: result.accessToken,
        organizations: result.organizations,
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const userAgent = req.headers['user-agent'] || 'unknown';
      const ipAddress = req.ip || req.connection?.remoteAddress || '';
      const result = await AuthService.loginWithGoogle({
        credential: req.body.credential,
        userAgent,
        ipAddress,
      });

      setAuthCookies(res, result);

      return sendSuccess(res, 'Logged in successfully with Google', {
        user: result.user,
        accessToken: result.accessToken,
        organizations: result.organizations,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const userAgent = req.headers['user-agent'] || 'unknown';
      const ipAddress = req.ip || '';
      const tokens = await AuthService.refreshTokens({
        refreshToken,
        userAgent,
        ipAddress,
      });

      setAuthCookies(res, tokens);

      return sendSuccess(res, 'Token refreshed successfully', {
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      await AuthService.logout({ refreshToken });
      res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
      res.clearCookie('accessToken', COOKIE_OPTIONS);
      return sendSuccess(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req, res, next) {
    try {
      await AuthService.logoutAll(req.user._id);
      res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
      res.clearCookie('accessToken', COOKIE_OPTIONS);
      return sendSuccess(res, 'Logged out from all devices');
    } catch (error) {
      next(error);
    }
  }

  static async me(req, res, next) {
    try {
      return sendSuccess(res, 'Current user retrieved', {
        user: sanitizeUser(req.user),
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      await AuthService.forgotPassword(req.body.email);
      return sendSuccess(res, 'If an account exists with this email, password reset instructions have been sent.');
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      await AuthService.resetPassword(req.body);
      return sendSuccess(res, 'Password has been reset successfully. Please login with your new password.');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      await AuthService.changePassword(req.user._id, req.body);
      return sendSuccess(res, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getSessions(req, res, next) {
    try {
      const sessions = await AuthService.getSessions(req.user._id);
      return sendSuccess(res, 'Sessions retrieved', { sessions });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSession(req, res, next) {
    try {
      await AuthService.deleteSession(req.user._id, req.params.sessionId);
      return sendSuccess(res, 'Session terminated');
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
