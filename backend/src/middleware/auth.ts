import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { tokens } from '../utils/tokens.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'staff';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

function readBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token || null;
}

/** Rejects the request unless a valid admin JWT is present. */
export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = readBearerToken(req);
  if (!token) throw ApiError.unauthorized('Missing bearer token');

  let payload;
  try {
payload = tokens.verify(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired session');
  }

  const user = await User.findById(payload.sub).select('email role isActive').lean();
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

  req.user = {
    id: String(user._id),
    email: user.email,
    role: user.role as 'admin' | 'staff',
  };
  next();
});

/** Like `requireAuth` but never rejects — used for optional-auth public routes. */
export const attachUser = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = readBearerToken(req);
    if (!token) return next();
    try {
      const payload = tokens.verify(token);
      if (mongoose.isValidObjectId(payload.sub)) {
        const user = await User.findById(payload.sub).select('email role isActive').lean();
        if (user?.isActive) {
          req.user = {
            id: String(user._id),
            email: user.email,
            role: user.role as 'admin' | 'staff',
          };
        }
      }
    } catch {
      // An invalid token on a public route is simply treated as anonymous.
    }
    next();
  },
);

/** Restricts a route to specific roles. Must run after `requireAuth`. */
export function requireRole(...roles: Array<'admin' | 'staff'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
next();
  };
};