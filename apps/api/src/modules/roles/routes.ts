import { Router } from 'express';
import { z } from 'zod';
import { coreAdminPermissions } from '../../../../../packages/shared/src/index.js';
import { db } from '../../lib/db.js';
import { fail, idParam } from '../../lib/http.js';
import { requirePermission } from '../../middleware/security.js';
import { audit } from '../audit/service.js';
import { adminTransaction, protectLastAdmin } from './service.js';
export const roles = Router();
roles.get('/roles', requirePermission('permissions.manage'), async (_req, res) =>
  res.json({
    data: await db.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { key: 'asc' },
    }),
  }),
);
roles.get('/permissions', requirePermission('permissions.manage'), async (_req, res) =>
  res.json({ data: await db.permission.findMany({ orderBy: { key: 'asc' } }) }),
);
roles.put('/users/:id/roles', requirePermission('roles.assign'), async (req, res) => {
  const id = idParam(req);
  const { roleIds: ids } = z
    .object({ roleIds: z.array(z.string().uuid()).max(20) })
    .strict()
    .parse(req.body);
  const roleIds = [...new Set(ids)];
  const data = await adminTransaction(async (tx) => {
    const known = await tx.role.findMany({ where: { id: { in: roleIds } } });
    if (known.length !== roleIds.length) fail(422, 'UNKNOWN_ROLE', 'Vai trò không tồn tại');
    await protectLastAdmin(
      tx,
      id,
      known.some((r) => r.key === 'SUPER_ADMIN'),
    );
    await tx.userRole.deleteMany({ where: { userId: id } });
    await tx.userRole.createMany({ data: roleIds.map((roleId) => ({ userId: id, roleId })) });
    await audit(
      req.identity!.id,
      'roles.assign',
      'user',
      id,
      { roles: known.map((r) => r.key) },
      tx,
    );
    return { id, roles: known.map((r) => r.key) };
  });
  res.json({ data });
});
roles.put('/roles/:id/permissions', requirePermission('permissions.manage'), async (req, res) => {
  const id = idParam(req);
  const { permissionIds: ids } = z
    .object({ permissionIds: z.array(z.string().uuid()).max(100) })
    .strict()
    .parse(req.body);
  const permissionIds = [...new Set(ids)];
  const data = await adminTransaction(async (tx) => {
    const role = await tx.role.findUnique({ where: { id } });
    if (!role) fail(404, 'NOT_FOUND', 'Không tìm thấy vai trò');
    const permissions = await tx.permission.findMany({ where: { id: { in: permissionIds } } });
    if (permissions.length !== permissionIds.length)
      fail(422, 'UNKNOWN_PERMISSION', 'Quyền không tồn tại');
    if (
      role!.key === 'SUPER_ADMIN' &&
      !coreAdminPermissions.every((key) => permissions.some((p) => p.key === key))
    )
      fail(409, 'CORE_ADMIN_RIGHTS', 'Không thể gỡ quyền quản trị lõi khỏi Super Admin');
    await tx.rolePermission.deleteMany({ where: { roleId: id } });
    await tx.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
    });
    await audit(
      req.identity!.id,
      'permissions.update',
      'role',
      id,
      { permissions: permissions.map((p) => p.key) },
      tx,
    );
    return { id, permissions: permissions.map((p) => p.key) };
  });
  res.json({ data });
});
