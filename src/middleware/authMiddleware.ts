import type { Request, Response, NextFunction } from 'express';
import AuthTokenService from '../services/AuthTokenService.js';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      status: false,
      message: 'Authorization token required',
    });
  }

  const token = authHeader.slice(7);
  try {
    req.authUser = AuthTokenService.verify(token);
    return next();
  } catch {
    return res.status(401).json({
      status: false,
      message: 'Invalid or expired token',
    });
  }
}
