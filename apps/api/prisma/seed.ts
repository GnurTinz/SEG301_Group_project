import '../src/config/env.js';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { z } from 'zod';
import { rolePermissions, permissionKeys } from '../../../packages/shared/src/index.js';
import { seedContent } from './seed-content.js';
const db = new PrismaClient();
export async function seedIdentity() {
  const password = z
    .string()
    .min(12)
    .max(128)
    .refine((v) => !v.includes('REPLACE_'))
    .parse(process.env.DEMO_PASSWORD);
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await db.$transaction(async (db) => {
    for (const key of permissionKeys)
      await db.permission.upsert({ where: { key }, create: { key, description: key }, update: {} });
    const usernames = {
      USER: 'user',
      CONTENT_MANAGER: 'manager',
      MODERATOR: 'moderator',
      SEO_SPECIALIST: 'seo',
      SUPER_ADMIN: 'admin',
    };
    for (const [key, keys] of Object.entries(rolePermissions)) {
      const existingRole = await db.role.findUnique({ where: { key } });
      const role = await db.role.upsert({ where: { key }, create: { key, name: key }, update: {} });
      if (!existingRole)
        for (const p of keys) {
          const permission = await db.permission.findUniqueOrThrow({ where: { key: p } });
          await db.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
            create: { roleId: role.id, permissionId: permission.id },
            update: {},
          });
        }
      const username = usernames[key as keyof typeof usernames];
      const existingUser = await db.user.findUnique({ where: { email: `${username}@demo.local` } });
      const user = await db.user.upsert({
        where: { email: `${username}@demo.local` },
        create: {
          email: `${username}@demo.local`,
          username,
          displayName: `Demo ${key}`,
          passwordHash,
        },
        update: {},
      });
      if (!existingUser)
        await db.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId: role.id } },
          create: { userId: user.id, roleId: role.id },
          update: {},
        });
    }
    for (const [key, valueJson] of Object.entries({
      siteName: 'Điểm Mới',
      commentsEnabled: true,
      logRetentionDays: 90,
    }))
      await db.setting.upsert({ where: { key }, create: { key, valueJson }, update: {} });
  });
}
await seedIdentity();
await seedContent(db);
console.info(
  'Seeded five roles/users, settings, 80 original articles and demo engagement (idempotent).',
);
await db.$disconnect();
