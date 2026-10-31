import { randomUUID } from 'node:crypto';
import sanitizeHtml from 'sanitize-html';
import { decodeHTML } from 'entities';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { db } from '../../lib/db.js';
import { fail, pagination } from '../../lib/http.js';
export const publicWhere = { status: 'PUBLISHED' as const, deletedAt: null };
export const documentInclude = {
  category: true,
  tags: { include: { tag: true } },
} satisfies Prisma.DocumentInclude;
export const listSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  author: true,
  category: true,
  tags: { include: { tag: true } },
  coverImageUrl: true,
  coverImageAlt: true,
  publishedAt: true,
  createdAt: true,
  viewsCount: true,
  status: true,
} satisfies Prisma.DocumentSelect;
const date = z.iso.datetime({ offset: true }).or(z.iso.date());
export const filtersSchema = pagination
  .extend({
    category: z.string().max(100).optional(),
    tag: z.string().max(100).optional(),
    from: date.optional(),
    to: date.optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED']).optional(),
  })
  .refine(
    (v) => !v.from || !v.to || Date.parse(v.from) <= Date.parse(v.to),
    'Invalid date interval',
  );
export function dateRange(from?: string, to?: string) {
  return {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lte: new Date(to.length === 10 ? `${to}T23:59:59.999Z` : to) } : {}),
  };
}
export function whereFilters(f: z.infer<typeof filtersSchema>): Prisma.DocumentWhereInput {
  return {
    ...(f.category ? { category: { slug: f.category } } : {}),
    ...(f.tag ? { tags: { some: { tag: { slug: f.tag } } } } : {}),
    ...(f.from || f.to ? { publishedAt: dateRange(f.from, f.to) } : {}),
  };
}
export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90) || 'bai-viet';
export const uniqueSlug = (title: string) => `${slugify(title)}-${randomUUID().slice(0, 8)}`;
export function cleanContent(html: string) {
  const content = sanitizeHtml(html, {
    allowedTags: [
      'p',
      'h2',
      'h3',
      'h4',
      'ul',
      'ol',
      'li',
      'strong',
      'em',
      'blockquote',
      'code',
      'pre',
      'a',
      'br',
    ],
    allowedAttributes: { a: ['href', 'title', 'rel'] },
    allowedSchemes: ['http', 'https'],
    transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }) },
  });
  const contentPlain = decodeHTML(
    sanitizeHtml(content.replace(/<\/(p|h[234]|li|blockquote|pre)>/g, ' </$1>'), {
      allowedTags: [],
      allowedAttributes: {},
    }),
  )
    .replace(/\s+/g, ' ')
    .trim();
  if (!contentPlain) fail(422, 'EMPTY_CONTENT', 'Nội dung không được để trống');
  return { content, contentPlain };
}
const plain = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((s) => !/<[^>]*>/.test(s), 'Use plain text');
export const authoring = z
  .object({
    title: plain(200),
    summary: plain(600),
    content: z.string().min(1).max(100000),
    categoryId: z.string().uuid(),
    tagIds: z.array(z.string().uuid()).max(20).optional(),
    coverImageUrl: z
      .string()
      .regex(/^\/(uploads\/[a-f0-9-]+\.(jpg|png|webp)|covers\/[a-z-]+\.svg)$/)
      .nullable()
      .optional(),
    coverImageAlt: z.string().trim().max(300).optional(),
  })
  .strict();
export async function publishedDocument(id: string) {
  const doc = await db.document.findFirst({ where: { id, ...publicWhere } });
  if (!doc) fail(404, 'NOT_FOUND', 'Không tìm thấy bài viết');
  return doc!;
}
export async function validateReferences(categoryId?: string, tagIds?: string[]) {
  if (categoryId && !(await db.category.findUnique({ where: { id: categoryId } })))
    fail(422, 'INVALID_CATEGORY', 'Danh mục không tồn tại');
  if (
    tagIds &&
    (await db.tag.count({ where: { id: { in: [...new Set(tagIds)] } } })) !== new Set(tagIds).size
  )
    fail(422, 'INVALID_TAGS', 'Nhãn không tồn tại');
}
