import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  sub: string;
  email: string;
  role: 'admin' | 'staff';
}

export const tokens = {
  sign(payload: TokenPayload): string {
    // `sub` is already inside the payload, so it must not also be set as an option.
    return jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
  },
  verify(token: string): TokenPayload {
    return jwt.verify(token, env.jwtSecret) as TokenPayload;
  },
};