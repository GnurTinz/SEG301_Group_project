import { Client } from 'pg';
export async function testEnvironment() {
  const dbUrl = new URL(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || '');
  if (!process.env.TEST_DATABASE_URL) dbUrl.pathname = '/portal_test';
  const name = dbUrl.pathname.slice(1);
  if (!/^[a-z][a-z0-9_]*_test$/.test(name) || name.length > 63)
    throw new Error('Tests require a separate database with a simple name ending in _test');
  const adminUrl = new URL(dbUrl);
  adminUrl.pathname = '/postgres';
  const client = new Client({ connectionString: adminUrl.href });
  await client.connect();
  try {
    if (!(await client.query('SELECT 1 FROM pg_database WHERE datname=$1', [name])).rowCount) {
      // Identifier is limited to the safe character set above; PostgreSQL cannot bind identifiers.
      try {
        await client.query(`CREATE DATABASE "${name}"`);
      } catch (e) {
        if (e.code !== '42P04') throw e;
      }
    }
  } finally {
    await client.end();
  }
  return {
    ...process.env,
    DATABASE_URL: dbUrl.href,
    TEST_DATABASE_URL: dbUrl.href,
    NODE_ENV: 'test',
  };
}
