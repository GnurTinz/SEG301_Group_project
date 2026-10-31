import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { fail } from '../../lib/http.js';
import { identity, requireAuth } from '../../middleware/security.js';
export const users = Router();
users.get('/me', requireAuth, (req, res) => res.json({ data: req.identity }));
users.patch('/me', requireAuth, async (req, res) => {
  const data = z
    .object({
      displayName: z.string().trim().min(1).max(80).optional(),
      bio: z.string().trim().max(1000).optional(),
    })
    .strict()
    .refine((v) => Object.keys(v).length > 0)
    .parse(req.body);
  await db.user.update({ where: { id: req.identity!.id }, data });
  res.json({ data: await identity(req.identity!.id) });
});
users.get('/:username', async (req, res) => {
  const username = z
    .string()
    .regex(/^[a-zA-Z0-9_]{3,30}$/)
    .parse(req.params.username)
    .toLowerCase();
  const data = await db.user.findFirst({
    where: { username, status: 'ACTIVE' },
    select: { username: true, displayName: true, bio: true, avatarUrl: true },
  });
  if (!data) fail(404, 'NOT_FOUND', 'Không tìm thấy hồ sơ');
  res.json({ data });
});
