import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export const fail = (status: number, code: string, message: string): never => {
  throw new HttpError(status, code, message);
};
export const uuid = z.string().uuid();
export const idParam = (req: Request) => uuid.parse(req.params.id);
export const pagination = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});
export function paged(
  res: Response,
  data: unknown[],
  total: number,
  page: number,
  pageSize: number,
  extra = {},
) {
  return res.json({
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), ...extra },
  });
}
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError)
    return res
      .status(422)
      .json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dữ liệu không hợp lệ',
          details: err.issues.map((i) => ({ path: i.path, message: i.message })),
        },
      });
  if (err instanceof HttpError)
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002')
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'Dữ liệu đã tồn tại' } });
    if (err.code === 'P2025')
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy dữ liệu' } });
    if (err.code === 'P2003' || err.code === 'P2004')
      return res
        .status(409)
        .json({
          error: {
            code: 'REFERENCE_CONFLICT',
            message: 'Dữ liệu liên quan không hợp lệ hoặc đang được sử dụng',
          },
        });
    if (err.code === 'P2034')
      return res
        .status(409)
        .json({ error: { code: 'RETRY', message: 'Dữ liệu vừa thay đổi, vui lòng thử lại' } });
  }
  const e = err as { status?: number; type?: string; code?: string };
  if (e.type === 'entity.parse.failed')
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'JSON không hợp lệ' } });
  if (e.status === 413 || e.code === 'LIMIT_FILE_SIZE')
    return res.status(413).json({ error: { code: 'TOO_LARGE', message: 'Dữ liệu vượt giới hạn' } });
  if (e.code?.startsWith('LIMIT_'))
    return res
      .status(422)
      .json({ error: { code: 'UPLOAD_INVALID', message: 'Dữ liệu tải lên không hợp lệ' } });
  console.error('Request failed', {
    kind: err instanceof Error ? err.constructor.name : 'Unknown',
  });
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Lỗi máy chủ' } });
}
