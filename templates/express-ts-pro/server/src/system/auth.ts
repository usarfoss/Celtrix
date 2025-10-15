import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type JwtUser = {
  sub: string;
  roles?: string[];
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const decoded = jwt.verify(token, secret) as JwtUser;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];
    const ok = roles.every((r) => userRoles.includes(r));
    if (!ok) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}


