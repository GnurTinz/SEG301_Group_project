import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { requirePermission } from '../../middleware/security.js';
import { audit } from '../audit/service.js';
export const settings = Router();
settings.use('/settings', requirePermission('settings.manage'));
settings.get('/settings', async (_req, res) =>
  res.json({
    data: Object.fromEntries((await db.setting.findMany()).map((s) => [s.key, s.valueJson])),
  }),
);
settings.patch('/settings', async (req, res) => {
  const input = z
    .object({
      siteName: z.string().trim().min(1).max(100).optional(),
      commentsEnabled: z.boolean().optional(),
      logRetentionDays: z.number().int().min(7).max(365).optional(),
    })
    .strict()
    .refine((v) => Object.keys(v).length > 0)
    .parse(req.body);
  await db.$transaction(async (tx) => {
    for (const [key, valueJson] of Object.entries(input))
      await tx.setting.upsert({
        where: { key },
        create: { key, valueJson, updatedBy: req.identity!.id },
        update: { valueJson, updatedBy: req.identity!.id },
      });
    await audit(
      req.identity!.id,
      'settings.update',
      'settings',
      undefined,
      { fields: Object.keys(input) },
      tx,
    );
  });
  res.json({
    data: Object.fromEntries((await db.setting.findMany()).map((s) => [s.key, s.valueJson])),
  });
});
