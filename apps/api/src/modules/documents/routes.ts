import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { fail, idParam, paged } from '../../lib/http.js';
import { requirePermission, visitor } from '../../middleware/security.js';
import { audit } from '../audit/service.js';
import {
  authoring,
  cleanContent,
  documentInclude,
  filtersSchema,
  listSelect,
  publicWhere,
  uniqueSlug,
  validateReferences,
  whereFilters,
} from './service.js';
export const documents = Router();
export const adminDocuments = Router();
documents.get('/', async (req, res) => {
  const f = filtersSchema.parse(req.query);
  const where = { ...whereFilters(f), ...publicWhere };
  const [data, total] = await db.$transaction([
    db.document.findMany({
      where,
      select: listSelect,
      orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
    }),
    db.document.count({ where }),
  ]);
  paged(res, data, total, f.page, f.pageSize);
});
adminDocuments.get('/', requirePermission('documents.update'), async (req, res) => {
  const f = filtersSchema.parse(req.query);
  const where = { ...whereFilters(f), deletedAt: null, ...(f.status ? { status: f.status } : {}) };
  const [data, total] = await db.$transaction([
    db.document.findMany({
      where,
      select: listSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
    }),
    db.document.count({ where }),
  ]);
  paged(res, data, total, f.page, f.pageSize);
});
adminDocuments.get('/:id', requirePermission('documents.update'), async (req, res) => {
  const data = await db.document.findFirst({
    where: { id: idParam(req), deletedAt: null },
    include: documentInclude,
  });
  if (!data) fail(404, 'NOT_FOUND', 'Không tìm thấy bài viết');
  res.json({ data });
});
documents.post('/', requirePermission('documents.create'), async (req, res) => {
  const input = authoring.parse(req.body);
  await validateReferences(input.categoryId, input.tagIds);
  if (input.coverImageUrl && !input.coverImageAlt?.trim())
    fail(422, 'ALT_REQUIRED', 'Ảnh cần mô tả thay thế');
  const { tagIds = [], ...data } = input;
  const doc = await db.$transaction(async (tx) => {
    const d = await tx.document.create({
      data: {
        ...data,
        ...cleanContent(input.content),
        slug: uniqueSlug(input.title),
        author: req.identity!.displayName,
        authorId: req.identity!.id,
        tags: { create: [...new Set(tagIds)].map((tagId) => ({ tagId })) },
      },
      include: documentInclude,
    });
    await audit(req.identity!.id, 'documents.create', 'document', d.id, {}, tx);
    return d;
  });
  res.status(201).json({ data: doc });
});
documents.patch('/:id', requirePermission('documents.update'), async (req, res) => {
  const id = idParam(req);
  const input = authoring
    .partial()
    .refine((v) => Object.keys(v).length > 0)
    .parse(req.body);
  const old = await db.document.findFirst({ where: { id, deletedAt: null } });
  if (!old) fail(404, 'NOT_FOUND', 'Không tìm thấy bài viết');
  await validateReferences(input.categoryId, input.tagIds);
  if (
    (input.coverImageUrl ?? old!.coverImageUrl) &&
    !(input.coverImageAlt ?? old!.coverImageAlt)?.trim()
  )
    fail(422, 'ALT_REQUIRED', 'Ảnh cần mô tả thay thế');
  const { tagIds, ...data } = input;
  const doc = await db.$transaction(async (tx) => {
    const d = await tx.document.update({
      where: { id },
      data: {
        ...data,
        ...(input.content !== undefined ? cleanContent(input.content) : {}),
        ...(tagIds
          ? { tags: { deleteMany: {}, create: [...new Set(tagIds)].map((tagId) => ({ tagId })) } }
          : {}),
      },
      include: documentInclude,
    });
    await audit(req.identity!.id, 'documents.update', 'document', id, {}, tx);
    return d;
  });
  res.json({ data: doc });
});
documents.patch('/:id/status', requirePermission('documents.publish'), async (req, res) => {
  const id = idParam(req);
  const { status } = z
    .object({ status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED']) })
    .strict()
    .parse(req.body);
  const data = await db.$transaction(async (tx) => {
    const old = await tx.document.findFirst({ where: { id, deletedAt: null } });
    if (!old) fail(404, 'NOT_FOUND', 'Không tìm thấy bài viết');
    const d = await tx.document.update({
      where: { id },
      data: {
        status,
        ...(status === 'PUBLISHED' ? { publishedAt: old!.publishedAt ?? new Date() } : {}),
      },
    });
    await audit(req.identity!.id, 'documents.status', 'document', id, { status }, tx);
    return d;
  });
  res.json({ data });
});
documents.delete('/:id', requirePermission('documents.delete'), async (req, res) => {
  const id = idParam(req);
  await db.$transaction(async (tx) => {
    const r = await tx.document.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (!r.count) fail(404, 'NOT_FOUND', 'Không tìm thấy bài viết');
    await audit(req.identity!.id, 'documents.delete', 'document', id, {}, tx);
  });
  res.json({ data: { success: true } });
});
documents.get('/:slug', async (req, res) => {
  const slug = z.string().min(1).max(200).parse(req.params.slug);
  const data = await db.document.findFirst({
    where: { slug, ...publicWhere },
    include: documentInclude,
  });
  if (!data) fail(404, 'NOT_FOUND', 'Không tìm thấy bài viết');
  const viewerKey = visitor(req);
  const bucket = BigInt(Math.floor(Date.now() / (30 * 60000)));
  await db.$transaction(async (tx) => {
    const inserted = await tx.documentView.createMany({
      data: { documentId: data!.id, userId: req.identity?.id, viewerKey, bucket },
      skipDuplicates: true,
    });
    if (inserted.count)
      await tx.document.update({ where: { id: data!.id }, data: { viewsCount: { increment: 1 } } });
  });
  const [likesCount, ratings, ownLike, ownRating, updated] = await Promise.all([
    db.documentLike.count({ where: { documentId: data!.id } }),
    db.documentRating.aggregate({
      where: { documentId: data!.id },
      _avg: { value: true },
      _count: true,
    }),
    req.identity
      ? db.documentLike.findUnique({
          where: { documentId_userId: { documentId: data!.id, userId: req.identity.id } },
        })
      : null,
    req.identity
      ? db.documentRating.findUnique({
          where: { documentId_userId: { documentId: data!.id, userId: req.identity.id } },
        })
      : null,
    db.document.findUniqueOrThrow({ where: { id: data!.id }, select: { viewsCount: true } }),
  ]);
  res.json({
    data: {
      ...data,
      viewsCount: updated.viewsCount,
      likesCount,
      averageRating: ratings._avg.value,
      ratingsCount: ratings._count,
      ownLiked: !!ownLike,
      ownRating: ownRating?.value ?? null,
    },
  });
});
