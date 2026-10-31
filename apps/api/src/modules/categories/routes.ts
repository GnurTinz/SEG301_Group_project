import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { fail, idParam } from '../../lib/http.js';
import { requirePermission } from '../../middleware/security.js';
import { uniqueSlug } from '../documents/service.js';
import { audit } from '../audit/service.js';
export const categories = Router();
const schema = z
  .object({ name: z.string().trim().min(1).max(100), description: z.string().max(1000).optional() })
  .strict();
categories.get('/', async (_req, res) =>
  res.json({ data: await db.category.findMany({ orderBy: { name: 'asc' } }) }),
);
categories.post('/', requirePermission('taxonomy.manage'), async (req, res) => {
  const input = schema.parse(req.body);
  const data = await db.$transaction(async (tx) => {
    const d = await tx.category.create({ data: { ...input, slug: uniqueSlug(input.name) } });
    await audit(req.identity!.id, 'categories.create', 'category', d.id, {}, tx);
    return d;
  });
  res.status(201).json({ data });
});
categories.patch('/:id', requirePermission('taxonomy.manage'), async (req, res) => {
  const id = idParam(req);
  const input = schema
    .partial()
    .refine((v) => Object.keys(v).length > 0)
    .parse(req.body);
  const data = await db.$transaction(async (tx) => {
    const d = await tx.category.update({ where: { id }, data: input });
    await audit(req.identity!.id, 'categories.update', 'category', id, {}, tx);
    return d;
  });
  res.json({ data });
});
categories.delete('/:id', requirePermission('taxonomy.manage'), async (req, res) => {
  const id = idParam(req);
  await db.$transaction(async (tx) => {
    if (await tx.document.count({ where: { categoryId: id } }))
      fail(409, 'IN_USE', 'Danh mục đang được sử dụng');
    await tx.category.delete({ where: { id } });
    await audit(req.identity!.id, 'categories.delete', 'category', id, {}, tx);
  });
  res.json({ data: { success: true } });
});
