import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { fail, HttpError } from '../../lib/http.js';
import { requirePermission, limiter } from '../../middleware/security.js';
export const uploads = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 1, fieldSize: 1000 },
  fileFilter: (_req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
      return cb(new Error('INVALID_MIME'));
    cb(null, true);
  },
});
export function imageType(b: Buffer) {
  if (b.length >= 12 && b.subarray(0, 3).equals(Buffer.from([255, 216, 255])))
    return { mime: 'image/jpeg', ext: 'jpg' };
  if (b.length >= 24 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return { mime: 'image/png', ext: 'png' };
  if (
    b.length >= 16 &&
    b.subarray(0, 4).toString() === 'RIFF' &&
    b.subarray(8, 12).toString() === 'WEBP'
  )
    return { mime: 'image/webp', ext: 'webp' };
  return null;
}
uploads.post(
  '/images',
  requirePermission('documents.create'),
  limiter(20),
  (req, res, next) =>
    upload.single('image')(req, res, (err) => {
      if (err && (err as Error).message === 'INVALID_MIME')
        return next(new HttpError(422, 'UPLOAD_INVALID', 'Ảnh không hợp lệ'));
      next(err);
    }),
  async (req, res) => {
    const alt = z.string().trim().min(1).max(300).parse(req.body.alt);
    const f = req.file;
    if (!f) fail(422, 'IMAGE_REQUIRED', 'Vui lòng chọn ảnh');
    const type = imageType(f!.buffer);
    if (!type || type.mime !== f!.mimetype)
      fail(422, 'INVALID_IMAGE', 'Định dạng ảnh không hợp lệ');
    const name = `${randomUUID()}.${type!.ext}`;
    await mkdir(env.UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(env.UPLOAD_DIR, name), f!.buffer, { flag: 'wx' });
    res.status(201).json({ data: { url: `/uploads/${name}`, alt } });
  },
);
