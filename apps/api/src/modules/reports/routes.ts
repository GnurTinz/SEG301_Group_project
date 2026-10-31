import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../lib/db.js';
import { fail } from '../../lib/http.js';
import { limiter, requirePermission } from '../../middleware/security.js';
import { publishedDocument, publicWhere } from '../documents/service.js';
export const reports = Router();
reports.post('/', requirePermission('reports.create'), limiter(10), async (req, res) => {
  const input = z
    .object({
      documentId: z.string().uuid().optional(),
      commentId: z.string().uuid().optional(),
      reason: z.enum(['SPAM', 'HARASSMENT', 'MISINFORMATION', 'OTHER']),
      description: z.string().trim().max(2000).default(''),
    })
    .strict()
    .refine((x) => !!x.documentId !== !!x.commentId, 'Exactly one target is required')
    .parse(req.body);
  if (input.documentId) await publishedDocument(input.documentId);
  if (
    input.commentId &&
    !(await db.comment.findFirst({
      where: { id: input.commentId, status: 'VISIBLE', deletedAt: null, document: publicWhere },
    }))
  )
    fail(404, 'NOT_FOUND', 'Không tìm thấy bình luận');
  res
    .status(201)
    .json({ data: await db.report.create({ data: { ...input, reporterId: req.identity!.id } }) });
});
