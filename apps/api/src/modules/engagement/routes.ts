import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { idParam } from '../../lib/http.js';
import { requirePermission, limiter } from '../../middleware/security.js';
import { publishedDocument } from '../documents/service.js';
export const engagement = Router({ mergeParams: true });
engagement.use(['/like', '/rating'], requirePermission('engagement.manage_own'), limiter(60));
engagement.put('/like', async (req, res) => {
  const documentId = idParam(req);
  await publishedDocument(documentId);
  const userId = req.identity!.id;
  await db.documentLike.upsert({
    where: { documentId_userId: { documentId, userId } },
    create: { documentId, userId },
    update: {},
  });
  res.json({ data: { liked: true } });
});
engagement.delete('/like', async (req, res) => {
  const documentId = idParam(req);
  await publishedDocument(documentId);
  await db.documentLike.deleteMany({ where: { documentId, userId: req.identity!.id } });
  res.json({ data: { liked: false } });
});
engagement.put('/rating', async (req, res) => {
  const documentId = idParam(req);
  await publishedDocument(documentId);
  const { value } = z
    .object({ value: z.number().int().min(1).max(5) })
    .strict()
    .parse(req.body);
  const userId = req.identity!.id;
  await db.documentRating.upsert({
    where: { documentId_userId: { documentId, userId } },
    create: { documentId, userId, value },
    update: { value },
  });
  res.json({ data: { value } });
});
engagement.delete('/rating', async (req, res) => {
  const documentId = idParam(req);
  await publishedDocument(documentId);
  await db.documentRating.deleteMany({ where: { documentId, userId: req.identity!.id } });
  res.json({ data: { value: null } });
});
