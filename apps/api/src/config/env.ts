import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';
dotenv.config({ path: [path.resolve('.env'), path.resolve('../../.env')], quiet: true });
export const env = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
    DATABASE_URL: z.string().startsWith('postgresql://'),
    SESSION_SECRET: z
      .string()
      .min(32)
      .refine((v) => !v.includes('REPLACE_'), 'Set a random session secret'),
    UPLOAD_DIR: z.string().default('uploads'),
  })
  .parse(process.env);
