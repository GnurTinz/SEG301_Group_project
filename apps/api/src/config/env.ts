import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';
dotenv.config({ path: [path.resolve('.env'), path.resolve('../../.env')], quiet: true });
export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    HOST: z.string().min(1).default('0.0.0.0'),
    TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
    WEB_ORIGIN: z
      .string()
      .url()
      .refine((value) => {
        try {
          const url = new URL(value);
          return ['http:', 'https:'].includes(url.protocol) && url.origin === value;
        } catch {
          return false;
        }
      }, 'WEB_ORIGIN must be an origin without a path or trailing slash')
      .default('http://localhost:5173'),
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (value) => /^postgres(?:ql)?:\/\//.test(value),
        'Use a PostgreSQL connection URL',
      ),
    SESSION_SECRET: z
      .string()
      .min(32)
      .refine((v) => !v.includes('REPLACE_'), 'Set a random session secret'),
    UPLOAD_DIR: z.string().default('uploads'),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV === 'production' && !value.WEB_ORIGIN.startsWith('https://'))
      context.addIssue({
        code: 'custom',
        path: ['WEB_ORIGIN'],
        message: 'Production requires an HTTPS WEB_ORIGIN',
      });
  });
export const env = envSchema.parse(process.env);
