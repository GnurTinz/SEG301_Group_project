import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { idParam } from '../../lib/http.js';
import { requirePermission } from '../../middleware/security.js';
import { uniqueSlug } from '../documents/service.js';
import { audit } from '../audit/service.js';
export const tags = Router();
const schema = z.object({ name: z.string().trim().min(1).max(100) }).strict();
tags.get('/', async (_req, res) =>
  res.json({ data: await db.tag.findMany({ orderBy: { name: 'asc' } }) }),
);
tags.post('/', requirePermission('taxonomy.manage'), async (req, res) => {
  const input = schema.parse(req.body);
  const data = await db.$transaction(async (tx) => {
    const d = await tx.tag.create({ data: { ...input, slug: uniqueSlug(input.name) } });
    await audit(req.identity!.id, 'tags.create', 'tag', d.id, {}, tx);
    return d;
  });
  res.status(201).json({ data });
});
tags.patch('/:id', requirePermission('taxonomy.manage'), async (req, res) => {
  const id = idParam(req);
  const input = schema.parse(req.body);
  const data = await db.$transaction(async (tx) => {
    const d = await tx.tag.update({ where: { id }, data: input });
    await audit(req.identity!.id, 'tags.update', 'tag', id, {}, tx);
    return d;
  });
  res.json({ data });
});
tags.delete('/:id', requirePermission('taxonomy.manage'), async (req, res) => {
  const id = idParam(req);
  await db.$transaction(async (tx) => {
    await tx.tag.delete({ where: { id } });
    await audit(req.identity!.id, 'tags.delete', 'tag', id, {}, tx);
  });
  res.json({ data: { success: true } });
});
