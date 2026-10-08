import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { tokens } from '../utils/tokens.js';

const SALT_ROUNDS = 12;

/** Throttles repeated failures for a single email to slow down brute force. */
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function assertNotThrottled(key: string): void {
  const entry = attempts.get(key);
  if (!entry) return;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.delete(key);
    return;
  }
  if (entry.count >= MAX_ATTEMPTS) {
    throw new ApiError(429, 'Too many failed attempts. Try again in 15 minutes.');
  }
}

function recordFailure(key: string): void {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() });
    return;
  }
  entry.count += 1;
}

function publicUser(user: { _id: unknown; name: string; email: string; role: string; lastLoginAt?: Date | null }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    lastLoginAt: user.lastLoginAt ?? null,
  };
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  assertNotThrottled(email);

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    recordFailure(email);
    throw ApiError.unauthorized('Incorrect email or password');
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    recordFailure(email);
    throw ApiError.unauthorized('Incorrect email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');

  attempts.delete(email);
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = tokens.sign({ sub: String(user._id), email: user.email, role: user.role as 'admin' });

  res.json({ token, user: publicUser(user) });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id).lean();
  if (!user) throw ApiError.notFound('Account not found');
  res.json({ user: publicUser(user) });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  const user = await User.findById(req.user?.id).select('+passwordHash');
  if (!user) throw ApiError.notFound('Account not found');

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) throw ApiError.badRequest('Current password is incorrect');

  if (await bcrypt.compare(newPassword, user.passwordHash)) {
    throw ApiError.badRequest('New password must be different from the current one');
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save({ validateBeforeSave: false });

  res.json({ message: 'Password updated successfully' });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as { name?: string };
  const user = await User.findByIdAndUpdate(
    req.user?.id,
    name ? { name: name.trim() } : {},
    { returnDocument: 'after', runValidators: true },
  ).lean();
  if (!user) throw ApiError.notFound('Account not found');
  res.json({ user: publicUser(user) });
});