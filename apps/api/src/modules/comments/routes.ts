import { Router } from 'express';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import { decodeHTML } from 'entities';
import type { Prisma } from '@prisma/client';
import { db } from '../../lib/db.js';
import { fail, idParam, paged, pagination } from '../../lib/http.js';
import { requireAuth, requirePermission, limiter } from '../../middleware/security.js';
import { publishedDocument, publicWhere } from '../documents/service.js';
import { audit } from '../audit/service.js';
export const documentComments = Router({ mergeParams: true });
export const comments = Router();
const bodySchema = z
  .string()
  .trim()
  .min(1)
  .max(4000)
  .transform((s) => decodeHTML(sanitizeHtml(s, { allowedTags: [], allowedAttributes: {} })).trim())
  .refine((s) => s.length > 0, 'Comment cannot be empty');
const include = {
  user: { select: { id: true, username: true, displayName: true } },
  mentions: { include: { mentionedUser: { select: { username: true } } } },
} satisfies Prisma.CommentInclude;
async function mentions(body: string, tx: Prisma.TransactionClient) {
  const names = [
    ...new Set(
      [...body.matchAll(/(?:^|\s)@([a-zA-Z0-9_]{3,30})\b/g)].map((m) => m[1]!.toLowerCase()),
    ),
  ];
  const users = await tx.user.findMany({
    where: { username: { in: names }, status: 'ACTIVE' },
    select: { id: true },
  });
  return users.map((u) => ({ mentionedUserId: u.id }));
}
documentComments.get('/', async (req, res) => {
  const id = idParam(req);
  await publishedDocument(id);
  const { page, pageSize } = pagination.parse(req.query);
  const where = {
    documentId: id,
    status: 'VISIBLE' as const,
    deletedAt: null,
    OR: [{ parentId: null }, { parent: { status: 'VISIBLE' as const, deletedAt: null } }],
  };
  const [data, total] = await db.$transaction([
    db.comment.findMany({
      where,
      include,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.comment.count({ where }),
  ]);
  paged(res, data, total, page, pageSize);
});
documentComments.post('/', requirePermission('comments.create'), limiter(20), async (req, res) => {
  const documentId = idParam(req);
  await publishedDocument(documentId);
  const setting = await db.setting.findUnique({ where: { key: 'commentsEnabled' } });
  if (setting?.valueJson === false) fail(409, 'COMMENTS_DISABLED', 'Bình luận đang tạm đóng');
  const input = z
    .object({ body: bodySchema, parentId: z.string().uuid().optional() })
    .strict()
    .parse(req.body);
  if (
    input.parentId &&
    !(await db.comment.findFirst({
      where: { id: input.parentId, documentId, parentId: null, status: 'VISIBLE', deletedAt: null },
    }))
  )
    fail(422, 'INVALID_PARENT', 'Bình luận trả lời không hợp lệ');
  const data = await db.$transaction(async (tx) =>
    tx.comment.create({
      data: {
        documentId,
        userId: req.identity!.id,
        body: input.body,
        parentId: input.parentId,
        mentions: { create: await mentions(input.body, tx) },
      },
      include,
    }),
  );
  res.status(201).json({ data });
});
comments.patch('/:id', requirePermission('comments.manage_own'), async (req, res) => {
  const id = idParam(req);
  const input = z.object({ body: bodySchema }).strict().parse(req.body);
  const old = await db.comment.findFirst({ where: { id, deletedAt: null, document: publicWhere } });
  if (!old) fail(404, 'NOT_FOUND', 'Không tìm thấy bình luận');
  if (old!.userId !== req.identity!.id)
    fail(403, 'NOT_OWNER', 'Bạn chỉ có thể sửa bình luận của mình');
  const data = await db.$transaction(async (tx) =>
    tx.comment.update({
      where: { id },
      data: {
        body: input.body,
        mentions: { deleteMany: {}, create: await mentions(input.body, tx) },
      },
      include,
    }),
  );
  res.json({ data });
});
comments.delete('/:id', requireAuth, async (req, res) => {
  const id = idParam(req);
  const old = await db.comment.findFirst({ where: { id, deletedAt: null } });
  if (!old) fail(404, 'NOT_FOUND', 'Không tìm thấy bình luận');
  const own =
    old!.userId === req.identity!.id && req.identity!.permissions.includes('comments.manage_own');
  const mod = req.identity!.permissions.includes('moderation.action');
  if (!own && !mod) fail(403, 'NOT_OWNER', 'Bạn không có quyền xóa bình luận này');
  await db.$transaction(async (tx) => {
    await tx.comment.update({ where: { id }, data: { deletedAt: new Date() } });
    if (mod && !own) await audit(req.identity!.id, 'moderation.delete', 'comment', id, {}, tx);
  });
  res.json({ data: { success: true } });
});
