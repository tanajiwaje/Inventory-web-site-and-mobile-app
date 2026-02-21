import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';

export type AuthUser = {
  id: string;
  role: string;
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const headerToken = header?.startsWith('Bearer ') ? header.replace('Bearer ', '').trim() : '';
  const queryToken =
    typeof req.query.token === 'string'
      ? req.query.token
      : typeof req.query.access_token === 'string'
        ? req.query.access_token
        : '';
  const token = headerToken || queryToken;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string; role: string };
    (req as Request & { user?: AuthUser }).user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: AuthUser }).user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
