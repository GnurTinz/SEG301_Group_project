import type { PrismaClient } from '@prisma/client';
import { articles } from './content/index.js';
import { cleanContent, slugify } from '../src/modules/documents/service.js';
export async function seedContent(db: PrismaClient) {
  const categoryDefinitions = [
    ['hoc-may', 'Học máy', 'Nền tảng dữ liệu, mô hình và đánh giá.'],
    ['thi-giac-may-tinh', 'Thị giác máy tính', 'Hiểu hình ảnh, video và các điều kiện quan sát.'],
    ['xu-ly-ngon-ngu', 'Xử lý ngôn ngữ', 'Văn bản, tiếng Việt và hệ thống ngôn ngữ.'],
    ['ung-dung-ai', 'Ứng dụng AI', 'Đưa công nghệ vào quy trình có thể kiểm chứng.'],
  ];
  const tagDefinitions = [
    ['hoc-sau', 'Học sâu'],
    ['du-lieu', 'Dữ liệu'],
    ['danh-gia', 'Đánh giá'],
    ['dao-duc', 'Đạo đức AI'],
    ['bao-mat', 'Bảo mật'],
    ['ung-dung', 'Ứng dụng'],
    ['transformer', 'Transformer'],
    ['ngon-ngu', 'Ngôn ngữ'],
    ['thi-giac', 'Thị giác'],
    ['ha-tang', 'Hạ tầng'],
    ['khoa-hoc', 'Khoa học'],
    ['ma-nguon-mo', 'Mã nguồn mở'],
  ];
  for (const [slug, name, description] of categoryDefinitions)
    await db.category.upsert({
      where: { slug: slug! },
      create: { slug: slug!, name: name!, description: description! },
      update: {},
    });
  for (const [slug, name] of tagDefinitions)
    await db.tag.upsert({
      where: { slug: slug! },
      create: { slug: slug!, name: name! },
      update: {},
    });
  const cats = await db.category.findMany();
  const tags = await db.tag.findMany();
  const manager = await db.user.findUniqueOrThrow({ where: { username: 'manager' } });
  const covers: Record<string, string> = {
    'hoc-may': 'network',
    'thi-giac-may-tinh': 'vision',
    'xu-ly-ngon-ngu': 'language',
    'ung-dung-ai': 'applications',
  };
  if (articles.length !== 80 || new Set(articles.map((a) => a.title)).size !== 80)
    throw new Error('Seed corpus must have 80 distinct titles');
  for (const [i, a] of articles.entries()) {
    const status = i < 72 ? 'PUBLISHED' : i < 76 ? 'DRAFT' : 'UNPUBLISHED';
    const date = new Date(Date.parse('2026-10-30T06:00:00Z') - i * 23 * 3600000);
    const clean = cleanContent(a.paragraphs.map((p) => `<p>${p}</p>`).join(''));
    await db.document.upsert({
      where: { slug: `seed-${slugify(a.title)}` },
      update: {},
      create: {
        title: a.title,
        slug: `seed-${slugify(a.title)}`,
        summary: a.summary,
        ...clean,
        categoryId: cats.find((c) => c.slug === a.category)!.id,
        author: 'Ban khoa học Điểm Mới',
        authorId: manager.id,
        status,
        createdAt: date,
        publishedAt: status === 'DRAFT' ? null : date,
        coverImageUrl: `/covers/${covers[a.category]}.svg`,
        coverImageAlt: `Minh họa hình học cho chuyên mục ${cats.find((c) => c.slug === a.category)!.name}`,
        seoTitle: a.title,
        seoDescription: a.summary,
        seoKeywords: a.tags.join(', '),
        tags: { create: a.tags.map((slug) => ({ tagId: tags.find((t) => t.slug === slug)!.id })) },
      },
    });
  }
  const doc = await db.document.findUniqueOrThrow({
    where: { slug: `seed-${slugify(articles[0]!.title)}` },
  });
  const user = await db.user.findUniqueOrThrow({ where: { username: 'user' } });
  const commentId = '00000000-0000-4000-8000-000000000001';
  await db.comment.upsert({
    where: { id: commentId },
    create: {
      id: commentId,
      documentId: doc.id,
      userId: user.id,
      body: 'Ví dụ về thời điểm dự đoán rất dễ hiểu. @manager có thể chia sẻ thêm cách chọn đường cơ sở không?',
    },
    update: {},
  });
  await db.commentMention.upsert({
    where: { commentId_mentionedUserId: { commentId, mentionedUserId: manager.id } },
    create: { commentId, mentionedUserId: manager.id },
    update: {},
  });
  await db.comment.upsert({
    where: { id: '00000000-0000-4000-8000-000000000002' },
    create: {
      id: '00000000-0000-4000-8000-000000000002',
      documentId: doc.id,
      userId: manager.id,
      parentId: commentId,
      body: 'Nên bắt đầu với quy tắc nghiệp vụ đang dùng và đo cùng một tập dữ liệu giữ lại.',
    },
    update: {},
  });
  await db.comment.upsert({
    where: { id: '00000000-0000-4000-8000-000000000003' },
    create: {
      id: '00000000-0000-4000-8000-000000000003',
      documentId: doc.id,
      userId: user.id,
      body: 'Bình luận mẫu để thực hành kiểm duyệt và xử lý báo cáo.',
    },
    update: {},
  });
  await db.documentLike.upsert({
    where: { documentId_userId: { documentId: doc.id, userId: user.id } },
    create: { documentId: doc.id, userId: user.id },
    update: {},
  });
  await db.documentRating.upsert({
    where: { documentId_userId: { documentId: doc.id, userId: user.id } },
    create: { documentId: doc.id, userId: user.id, value: 4 },
    update: {},
  });
  await db.report.upsert({
    where: { id: '00000000-0000-4000-8000-000000000004' },
    create: {
      id: '00000000-0000-4000-8000-000000000004',
      reporterId: manager.id,
      commentId: '00000000-0000-4000-8000-000000000003',
      reason: 'OTHER',
      description: 'Báo cáo demo để kiểm tra luồng resolve/dismiss.',
    },
    update: {},
  });
}
