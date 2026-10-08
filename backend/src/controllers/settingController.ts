import type { Request, Response } from 'express';
import { getSettings } from '../models/Setting.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { SettingsInput } from '../validators/schemas.js';

export const getSettingsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getSettings();
  res.json({ settings: settings.toJSON() });
});

/** Merges a partial update into the singleton settings document. */
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as SettingsInput;
  const settings = await getSettings();

  for (const section of ['business', 'commerce', 'seo', 'social', 'enquiry'] as const) {
    const patch = body[section];
    if (!patch) continue;
    const target = settings[section];
    if (target && typeof target === 'object') {
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined) continue;
        (target as Record<string, unknown>)[key] = value;
      }
    }
  }

  await settings.save();
  res.json({ settings: settings.toJSON() });
});