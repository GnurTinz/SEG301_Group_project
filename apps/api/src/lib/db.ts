import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { env } from '../config/env.js';
export const db = new PrismaClient();
export const sessionPool = new Pool({ connectionString: env.DATABASE_URL });
