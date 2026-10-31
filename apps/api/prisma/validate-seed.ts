import '../src/config/env.js';
import { PrismaClient } from '@prisma/client';
import { articles } from './content/index.js';
import { slugify } from '../src/modules/documents/service.js';
const db = new PrismaClient();
export async function validateSeed() {
  const docs = await db.document.findMany({
    where: { slug: { in: articles.map((a) => `seed-${slugify(a.title)}`) } },
    include: { tags: true, category: true },
  });
  const failures: string[] = [];
  if (docs.length !== 80) failures.push(`Expected 80 seed articles, found ${docs.length}`);
  if (docs.filter((d) => d.status === 'PUBLISHED' && !d.deletedAt).length < 70)
    failures.push('Fewer than 70 published seed articles');
  if (
    new Set(docs.map((d) => d.title)).size !== 80 ||
    new Set(docs.map((d) => d.contentPlain)).size !== 80
  )
    failures.push('Duplicate titles/content');
  for (const d of docs) {
    if (
      !d.title ||
      !d.summary ||
      !d.author ||
      !d.categoryId ||
      !d.content ||
      !d.contentPlain ||
      !d.coverImageAlt ||
      d.tags.length === 0
    )
      failures.push(`Missing fields: ${d.slug}`);
    if (/lorem ipsum|placeholder|TODO/i.test(d.contentPlain))
      failures.push(`Placeholder text: ${d.slug}`);
    if (d.contentPlain.split(/\s+/).length < 150)
      failures.push(
        `Under 150 whitespace-separated words: ${d.slug} (${d.contentPlain.split(/\s+/).length})`,
      );
    if (/<script|javascript:|onerror=/i.test(d.content)) failures.push(`Unsafe HTML: ${d.slug}`);
  }
  if (failures.length) throw new Error(failures.join('\n'));
  return {
    documents: docs.length,
    published: docs.filter((d) => d.status === 'PUBLISHED').length,
    categories: new Set(docs.map((d) => d.categoryId)).size,
    minWords: Math.min(...docs.map((d) => d.contentPlain.split(/\s+/).length)),
  };
}
try {
  console.info(await validateSeed());
} finally {
  await db.$disconnect();
}
