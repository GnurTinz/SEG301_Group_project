// Creates a new isolated database; preserves it for inspection and never drops existing data.
import dotenv from 'dotenv';
import { Client } from 'pg';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
dotenv.config({ quiet: true });
const url = new URL(process.env.DATABASE_URL || '');
const name = `portal_verify_${Date.now()}_test`;
const adminUrl = new URL(url);
adminUrl.pathname = '/postgres';
const client = new Client({ connectionString: adminUrl.href });
await client.connect();
// PostgreSQL identifiers cannot use value parameters. name is generated above, never user input.
if (!/^portal_verify_\d+_test$/.test(name)) throw new Error('Invalid generated identifier');
await client.query(`CREATE DATABASE "${name}"`);
await client.end();
url.pathname = `/${name}`;
const env = {
  ...process.env,
  DATABASE_URL: url.href,
  TEST_DATABASE_URL: url.href,
  NODE_ENV: 'test',
};
const steps = [
  [
    'node_modules/prisma/build/index.js',
    'migrate',
    'deploy',
    '--schema',
    'apps/api/prisma/schema.prisma',
  ],
  ['--import', 'tsx', 'apps/api/prisma/seed.ts'],
  ['--import', 'tsx', 'apps/api/prisma/seed.ts'],
  ['--import', 'tsx', 'apps/api/prisma/validate-seed.ts'],
  ['scripts/run-tests.mjs'],
  ['scripts/run-e2e.mjs'],
  ['scripts/run-tests.mjs'],
];
const evidence = { database: name, startedAt: new Date().toISOString(), steps: [] };
mkdirSync('.local', { recursive: true });
for (const args of steps) {
  const r = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  evidence.steps.push({ command: `node ${args.join(' ')}`, status: r.status });
  writeFileSync('.local/fresh-verification.json', JSON.stringify(evidence, null, 2));
  if (r.status !== 0) process.exit(r.status ?? 1);
}
console.info(
  `Fresh database verification passed: ${name}. Evidence in ignored .local/fresh-verification.json.`,
);
