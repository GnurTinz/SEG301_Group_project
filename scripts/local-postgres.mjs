// Optional local PostgreSQL process when Docker is unavailable. No system service is installed.
import EmbeddedPostgres from 'embedded-postgres';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });
mkdirSync('.local', { recursive: true });
const credentialsPath = resolve('.local/postgres.json');
const { readFileSync } = await import('node:fs');
const credentials = existsSync(credentialsPath)
  ? JSON.parse(readFileSync(credentialsPath, 'utf8'))
  : { password: randomBytes(24).toString('hex') };
if (!existsSync(credentialsPath))
  writeFileSync(credentialsPath, JSON.stringify(credentials), { mode: 0o600 });
const pg = new EmbeddedPostgres({
  databaseDir: resolve('.local/pgdata'),
  user: 'portal',
  password: credentials.password,
  port: 55432,
  persistent: true,
  authMethod: 'scram-sha-256',
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
  postgresFlags: ['-h', '127.0.0.1'],
  onLog: (m) => console.info(String(m)),
  onError: (m) => console.error(String(m)),
});
if (!existsSync('.local/pgdata/PG_VERSION')) await pg.initialise();
await pg.start();
const client = pg.getPgClient();
await client.connect();
for (const name of ['portal', 'portal_test']) {
  const found = await client.query('SELECT 1 FROM pg_database WHERE datname=$1', [name]);
  if (!found.rowCount) await pg.createDatabase(name);
}
await client.end();
if (!existsSync('.env')) {
  writeFileSync(
    '.env',
    `DATABASE_URL=postgresql://portal:${credentials.password}@127.0.0.1:55432/portal\nSESSION_SECRET=${randomBytes(48).toString('hex')}\nDEMO_PASSWORD=${randomBytes(18).toString('base64url')}\nWEB_ORIGIN=http://localhost:5173\nPORT=3001\n`,
    { mode: 0o600 },
  );
  console.info(
    'Created ignored .env with random local credentials. Read DEMO_PASSWORD locally to sign in.',
  );
}
console.info(
  'PostgreSQL is running on 127.0.0.1:55432; databases portal and portal_test. Keep this terminal open.',
);
let stopping = false;
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, async () => {
    if (stopping) return;
    stopping = true;
    await pg.stop();
    process.exit(0);
  });
setInterval(() => {}, 60000);
