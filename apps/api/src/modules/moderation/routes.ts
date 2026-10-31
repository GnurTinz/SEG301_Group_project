import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { fail, idParam, paged, pagination } from '../../lib/http.js';
import { requirePermission } from '../../middleware/security.js';
import { audit } from '../audit/service.js';
export const moderation = Router();
moderation.get('/comments', requirePermission('moderation.review'), async (req, res) => {
  const f = pagination
    .extend({ status: z.enum(['VISIBLE', 'HIDDEN', 'SPAM']).optional() })
    .parse(req.query);
  const where = { deletedAt: null, ...(f.status ? { status: f.status } : {}) };
  const [data, total] = await db.$transaction([
    db.comment.findMany({
      where,
      include: {
        user: { select: { username: true } },
        document: { select: { title: true, slug: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
    }),
    db.comment.count({ where }),
  ]);
  paged(res, data, total, f.page, f.pageSize);
});
moderation.patch(
  '/comments/:id/status',
  requirePermission('moderation.action'),
  async (req, res) => {
    const id = idParam(req);
    const { status } = z
      .object({ status: z.enum(['VISIBLE', 'HIDDEN', 'SPAM']) })
      .strict()
      .parse(req.body);
    const data = await db.$transaction(async (tx) => {
      if (!(await tx.comment.findFirst({ where: { id, deletedAt: null } })))
        fail(404, 'NOT_FOUND', 'Không tìm thấy bình luận');
      const d = await tx.comment.update({ where: { id }, data: { status } });
      await audit(req.identity!.id, 'moderation.comment_status', 'comment', id, { status }, tx);
      return d;
    });
    res.json({ data });
  },
);
moderation.get('/reports', requirePermission('moderation.review'), async (req, res) => {
  const f = pagination
    .extend({ status: z.enum(['OPEN', 'RESOLVED', 'DISMISSED']).optional() })
    .parse(req.query);
  const where = f.status ? { status: f.status } : {};
  const [data, total] = await db.$transaction([
    db.report.findMany({
      where,
      include: {
        reporter: { select: { username: true } },
        document: { select: { title: true } },
        comment: { select: { body: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
    }),
    db.report.count({ where }),
  ]);
  paged(res, data, total, f.page, f.pageSize);
});
moderation.patch('/reports/:id', requirePermission('moderation.action'), async (req, res) => {
  const id = idParam(req);
  const { status } = z
    .object({ status: z.enum(['RESOLVED', 'DISMISSED']) })
    .strict()
    .parse(req.body);
  const data = await db.$transaction(async (tx) => {
    const d = await tx.report.update({
      where: { id },
      data: { status, resolvedBy: req.identity!.id, resolvedAt: new Date() },
    });
    await audit(req.identity!.id, 'moderation.report_status', 'report', id, { status }, tx);
    return d;
  });
  res.json({ data });
});
