import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`No route matches ${req.method} ${req.originalUrl}`));
}

interface MongoLikeError {
  code?: number;
  name?: string;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message?: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Express identifies error middleware by arity, so `next` must stay declared.
  void next;

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      error: { message: error.message, details: error.details ?? null },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        details: error.issues.map((i) => ({
          field: i.path.join('.') || '(root)',
          message: i.message,
        })),
      },
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? `File is larger than the ${Math.round(env.uploadMaxBytes / 1024 / 1024)}MB limit`
        : error.message;
    res.status(400).json({ error: { message, details: null } });
    return;
  }

  const mongo = error as MongoLikeError;
  if (mongo?.code === 11000) {
    const fields = Object.keys(mongo.keyValue ?? {}).join(', ') || 'field';
    res.status(409).json({
      error: { message: `A record with that ${fields} already exists`, details: null },
    });
    return;
  }

  if (mongo?.code === 400 && mongo.errors) {
    res.status(400).json({ error: { message: 'Invalid document', details: mongo.errors } });
    return;
  }

  if (mongo?.name === 'CastError') {
    res.status(400).json({ error: { message: 'Malformed identifier', details: null } });
    return;
  }

  const message = error instanceof Error ? error.message : 'Unexpected server error';
  if (!env.isProduction) console.error('[error]', error);
  res.status(500).json({
    error: {
      message: env.isProduction ? 'Unexpected server error' : message,
      details: null,
    },
  });
}