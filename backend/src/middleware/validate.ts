import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodType } from 'zod';
import { ApiError } from '../utils/ApiError.js';

type Source = 'body' | 'query' | 'params';

/**
 * Validates one part of the request against a Zod schema and replaces it with
 * the parsed (coerced, stripped) value so handlers only see clean data.
 */
export function validate(schema: ZodType, source: Source = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(ApiError.badRequest('Validation failed', formatIssues(result.error)));
      return;
    }
    // req.query/params have read-only getters in Express 5, so stash on res.locals
    // for those and assign directly for the body.
    if (source === 'body') {
      req.body = result.data;
    } else {
      res.locals[source] = result.data;
    }
    next();
  };
}

/** Reads validated query/params that `validate()` stored on `res.locals`. */
export function validated<T>(res: Response, source: Source = 'query'): T {
  return res.locals[source] as T;
}

/**
 * Reads the `:id` route parameter that `idParamSchema` already validated, typed
 * as a plain string. Express 5 types `req.params` values as
 * `string | string[] | undefined`, so this avoids a cast at every call site.
 */
export function paramId(res: Response): string {
  return validated<{ id: string }>(res, 'params').id;
}

function formatIssues(error: ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}