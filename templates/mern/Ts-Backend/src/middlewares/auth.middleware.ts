import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../constant/env.constant';

export interface AuthUserPayload {
  sub: string; // user id
  roles?: string[];
  permissions?: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export function signJwt(payload: AuthUserPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ status: 'error', message: 'Unauthorized' });
    return;
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    }) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
}

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const roles = req.user?.roles || [];
    const isAllowed = roles.some((r) => allowedRoles.includes(r));
    if (!isAllowed) {
      res.status(403).json({ status: 'error', message: 'Forbidden' });
      return;
    }
    next();
  };
}


