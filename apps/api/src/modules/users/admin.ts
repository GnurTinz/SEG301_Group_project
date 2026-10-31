import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { idParam, paged, pagination } from '../../lib/http.js';
import { requirePermission } from '../../middleware/security.js';
import { adminTransaction, protectLastAdmin } from '../roles/service.js';
import { audit } from '../audit/service.js';
export const adminUsers = Router();
adminUsers.get('/users', requirePermission('users.manage'), async (req, res) => {
  const f = pagination.parse(req.query);
  const [data, total] = await db.$transaction([
    db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        status: true,
        roles: { include: { role: { select: { id: true, key: true, name: true } } } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
    }),
    db.user.count(),
  ]);
  paged(res, data, total, f.page, f.pageSize);
});
adminUsers.patch('/users/:id', requirePermission('users.manage'), async (req, res) => {
  const id = idParam(req);
  const { status } = z
    .object({ status: z.enum(['ACTIVE', 'SUSPENDED']) })
    .strict()
    .parse(req.body);
  const data = await adminTransaction(async (tx) => {
    await protectLastAdmin(tx, id, status === 'ACTIVE');
    const u = await tx.user.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });
    await audit(req.identity!.id, 'users.status', 'user', id, { status }, tx);
    return u;
  });
  res.json({ data });
});
