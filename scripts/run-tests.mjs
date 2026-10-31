import dotenv from 'dotenv';
import { spawnSync } from 'node:child_process';
import { testEnvironment } from './test-environment.mjs';
dotenv.config({ quiet: true });
const env = await testEnvironment();
for (const args of [
  [
    'node_modules/prisma/build/index.js',
    'migrate',
    'deploy',
    '--schema',
    'apps/api/prisma/schema.prisma',
  ],
  ['--import', 'tsx', 'apps/api/prisma/seed.ts'],
  ['node_modules/vitest/vitest.mjs', 'run', ...process.argv.slice(2)],
]) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
