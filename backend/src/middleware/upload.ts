import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
]);

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
};

fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, env.uploadDir);
  },
  filename(_req, file, cb) {
    const extension = EXTENSION_BY_MIME[file.mimetype] ?? path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, path.extname(file.originalname))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'image';
    const unique = crypto.randomBytes(6).toString('hex');
    cb(null, `${Date.now()}-${base}-${unique}${extension}`);
  },
});

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    return;
  }
  cb(null, true);
}

/** Single-file upload, e.g. `upload.single('image')`. */
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.uploadMaxBytes, files: 10 },
});

/** Maps a stored filename to the public URL the clients request. */
export function publicUrl(filename: string): string {
  return `/uploads/${filename}`;
}

/** Resolves a stored filename to its absolute path, guarding against traversal. */
export function resolveUploadPath(input: string): string | null {
  const filename = path.basename(input);
  const full = path.join(env.uploadDir, filename);
  if (!full.startsWith(env.uploadDir)) return null;
  return full;
}

/** Deletes an uploaded file if it lives inside the upload directory. */
export function deleteUpload(urlOrName: string | undefined | null): void {
  if (!urlOrName) return;
  if (!urlOrName.startsWith('/uploads/')) return;
  const full = resolveUploadPath(urlOrName.replace('/uploads/', ''));
  if (!full) return;
  fs.promises.unlink(full).catch(() => {
    // Already gone — nothing to clean up.
  });
}