import { describe, expect, it } from 'vitest';
import { createServer } from 'node:net';
import { createRequire } from 'node:module';
import { readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const generatedDir = dirname(require.resolve('.prisma/client/package.json'));
const engine = resolve(
  generatedDir,
  readdirSync(generatedDir).find((name) => /^(?:lib)?query_engine-.+\.node$/.test(name))!,
);
const prepare = resolve('scripts/prepare-dev.mjs');

async function reservePort() {
  const server = createServer();
  await new Promise<void>((done, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', done);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected a TCP address');
  return { server, port: address.port };
}

const runPrepare = (port: number) =>
  spawnSync(process.execPath, [prepare], {
    cwd: resolve('apps/api'),
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1' },
    encoding: 'utf8',
    timeout: 15000,
  });

describe('Windows-safe development preparation', () => {
  it('reuses a valid, formatted Prisma client without rewriting its native engine', async () => {
    const { server, port } = await reservePort();
    await new Promise<void>((done) => server.close(() => done()));
    const before = statSync(engine).mtimeMs;
    const result = runPrepare(port);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('Prisma Client is up to date; skipping generation.');
    expect(statSync(engine).mtimeMs).toBe(before);
  });

  it('rejects an occupied API port before attempting any Prisma generation', async () => {
    const { server, port } = await reservePort();
    try {
      const before = statSync(engine).mtimeMs;
      const result = runPrepare(port);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(`Port ${port} is already in use`);
      expect(result.stderr).toContain('No Prisma files were changed');
      expect(result.stdout).not.toContain('generating');
      expect(statSync(engine).mtimeMs).toBe(before);
    } finally {
      await new Promise<void>((done) => server.close(() => done()));
    }
  });
});
