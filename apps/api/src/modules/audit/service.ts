import type { Prisma } from '@prisma/client';
import { db } from '../../lib/db.js';
export const audit = (
  actorId: string | undefined,
  action: string,
  entityType: string,
  entityId?: string,
  metadataJson: Prisma.InputJsonObject = {},
  tx: Prisma.TransactionClient = db,
) => tx.auditLog.create({ data: { actorId, action, entityType, entityId, metadataJson } });
