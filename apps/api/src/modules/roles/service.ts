import type { Prisma } from '@prisma/client';
import { db } from '../../lib/db.js';
import { fail } from '../../lib/http.js';
export function adminTransaction<T>(work: (tx: Prisma.TransactionClient) => Promise<T>) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(301001)`;
    return work(tx);
  });
}
export async function protectLastAdmin(
  tx: Prisma.TransactionClient,
  userId: string,
  willRemainAdmin: boolean,
) {
  const target = await tx.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  if (!target) fail(404, 'NOT_FOUND', 'Không tìm thấy tài khoản');
  if (
    target!.status === 'ACTIVE' &&
    target!.roles.some((r) => r.role.key === 'SUPER_ADMIN') &&
    !willRemainAdmin
  ) {
    const count = await tx.user.count({
      where: { status: 'ACTIVE', roles: { some: { role: { key: 'SUPER_ADMIN' } } } },
    });
    if (count <= 1) fail(409, 'LAST_ADMIN', 'Không thể gỡ hoặc khóa Super Admin cuối cùng');
  }
  return target!;
}
