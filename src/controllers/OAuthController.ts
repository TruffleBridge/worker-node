import type { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import UserService from '../services/UserService.js';
import type { PassportAuthResult } from '../config/passport.js';

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}

function redirectWithToken(res: Response, result: PassportAuthResult): void {
  const redirectUrl = new URL('/auth/callback', getFrontendUrl());
  redirectUrl.searchParams.set('token', result.accessToken);
  res.redirect(redirectUrl.toString());
}

function redirectWithError(res: Response, message: string): void {
  const redirectUrl = new URL('/auth/error', getFrontendUrl());
  redirectUrl.searchParams.set('message', message);
  res.redirect(redirectUrl.toString());
}

class OAuthController {
  googleAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })(req, res, next);
  }

  googleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      'google',
      { session: false },
      (err: Error | null, result?: PassportAuthResult) => {
      if (err) {
        return redirectWithError(res, err.message || 'Google sign-in failed');
      }
      if (!result) {
        return redirectWithError(res, 'Google sign-in failed');
      }
      redirectWithToken(res, result);
    })(req, res, next);
  }

  facebookAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('facebook', {
      scope: ['email'],
    })(req, res, next);
  }

  facebookCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      'facebook',
      { session: false },
      (err: Error | null, result?: PassportAuthResult) => {
      if (err) {
        return redirectWithError(res, err.message || 'Facebook sign-in failed');
      }
      if (!result) {
        return redirectWithError(res, 'Facebook sign-in failed');
      }
      redirectWithToken(res, result);
    })(req, res, next);
  }

  async googleToken(req: Request, res: Response) {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({
          status: false,
          message: 'idToken is required',
        });
      }
      const result = await UserService.verifyGoogleIdToken(idToken);
      return res.status(200).json({
        status: true,
        message: 'Google sign-in successful',
        data: result,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed';
      return res.status(401).json({ status: false, message });
    }
  }

  async facebookToken(req: Request, res: Response) {
    try {
      const { accessToken } = req.body;
      if (!accessToken) {
        return res.status(400).json({
          status: false,
          message: 'accessToken is required',
        });
      }
      const result = await UserService.verifyFacebookAccessToken(accessToken);
      return res.status(200).json({
        status: true,
        message: 'Facebook sign-in successful',
        data: result,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Facebook sign-in failed';
      return res.status(401).json({ status: false, message });
    }
  }
}

export default new OAuthController();
