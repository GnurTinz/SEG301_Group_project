import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { paged } from '../../lib/http.js';
import { requirePermission } from '../../middleware/security.js';
import { dateRange, filtersSchema } from '../documents/service.js';
export const auditRoutes = Router();
auditRoutes.get('/audit-logs', requirePermission('audit.read'), async (req, res) => {
  const f = filtersSchema.parse(req.query);
  const action = z.string().max(100).optional().parse(req.query.action);
  const actorId = z.string().uuid().optional().parse(req.query.actor);
  const where = {
    ...(action ? { action } : {}),
    ...(actorId ? { actorId } : {}),
    createdAt: dateRange(f.from, f.to),
  };
  const [data, total] = await db.$transaction([
    db.auditLog.findMany({
      where,
      include: { actor: { select: { username: true } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
    }),
    db.auditLog.count({ where }),
  ]);
  paged(res, data, total, f.page, f.pageSize);
});
