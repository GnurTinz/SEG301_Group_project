import dotenv from 'dotenv';
import { spawnSync } from 'node:child_process';
import { testEnvironment } from './test-environment.mjs';
dotenv.config({ quiet: true });
const env = {
  ...(await testEnvironment()),
  WEB_ORIGIN: 'http://localhost:5173',
};
for (const args of [
  [
    'node_modules/prisma/build/index.js',
    'migrate',
    'deploy',
    '--schema',
    'apps/api/prisma/schema.prisma',
  ],
  ['--import', 'tsx', 'apps/api/prisma/seed.ts'],
  ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)],
]) {
  const r = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
