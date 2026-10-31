import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { fail, idParam, paged, pagination } from '../../lib/http.js';
import { requirePermission } from '../../middleware/security.js';
import { audit } from '../audit/service.js';
export const seo = Router();
seo.use(requirePermission('seo.edit'));
const select = {
  id: true,
  title: true,
  slug: true,
  status: true,
  seoTitle: true,
  seoDescription: true,
  seoKeywords: true,
  coverImageUrl: true,
  coverImageAlt: true,
} as const;
seo.get('/documents', async (req, res) => {
  const { page, pageSize } = pagination.parse(req.query);
  const where = { deletedAt: null };
  const [data, total] = await db.$transaction([
    db.document.findMany({
      where,
      select,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.document.count({ where }),
  ]);
  paged(res, data, total, page, pageSize);
});
seo.patch('/documents/:id', async (req, res) => {
  const id = idParam(req);
  const input = z
    .object({
      seoTitle: z.string().trim().max(200).optional(),
      seoDescription: z.string().trim().max(320).optional(),
      seoKeywords: z.string().trim().max(500).optional(),
      coverImageAlt: z.string().trim().max(300).optional(),
    })
    .strict()
    .refine((v) => Object.keys(v).length > 0)
    .parse(req.body);
  const old = await db.document.findFirst({ where: { id, deletedAt: null } });
  if (!old) fail(404, 'NOT_FOUND', 'Không tìm thấy bài viết');
  if (old!.coverImageUrl && input.coverImageAlt !== undefined && !input.coverImageAlt)
    fail(422, 'ALT_REQUIRED', 'Ảnh cần mô tả thay thế');
  const data = await db.$transaction(async (tx) => {
    const d = await tx.document.update({ where: { id }, data: input, select });
    await audit(req.identity!.id, 'seo.update', 'document', id, { fields: Object.keys(input) }, tx);
    return d;
  });
  res.json({ data });
});
