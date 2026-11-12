import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';

const root = fileURLToPath(new URL('../', import.meta.url));
const apiDir = resolve(root, 'apps/api');
const apiRequire = createRequire(resolve(apiDir, 'package.json'));
dotenv.config({ path: resolve(root, '.env'), quiet: true });

async function checkPort(port, host) {
  await new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.once('error', (error) => {
      if (error.code === 'EADDRINUSE')
        reject(
          new Error(
            `Port ${port} is already in use. Stop the previous dev command with Ctrl+C, then retry. No Prisma files were changed.`,
          ),
        );
      else reject(error);
    });
    probe.listen({ port, host, exclusive: true }, () => probe.close(resolvePort));
  });
}

function clientIsCurrent() {
  try {
    const generatedDir = dirname(apiRequire.resolve('.prisma/client/package.json'));
    const schema = readFileSync(resolve(apiDir, 'prisma/schema.prisma'), 'utf8');
    const generatedSchema = readFileSync(resolve(generatedDir, 'schema.prisma'), 'utf8');
    const { Prisma } = apiRequire('@prisma/client');
    const installedVersion = apiRequire('@prisma/client/package.json').version;
    // Importing metadata does not instantiate a client or load the native engine.
    return (
      Prisma?.prismaVersion?.client === installedVersion &&
      normalizeSchema(schema) === normalizeSchema(generatedSchema) &&
      readdirSync(generatedDir).some((name) => /^(?:lib)?query_engine-.+\.node$/.test(name))
    );
  } catch {
    // Missing package, uninitialized stub or incomplete generated output.
    return false;
  }
}

function normalizeSchema(schema) {
  // Prisma formats the generated schema. Ignore layout/comments while preserving
  // every quoted value, including spaces and escaped quotes in defaults/maps.
  return schema.replace(/"(?:\\.|[^"\\])*"|\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|\s+/g, (match) =>
    match.startsWith('"') ? match : '',
  );
}

try {
  const port = Number(process.env.PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('PORT must be an integer between 1 and 65535');
  // Check before generation so an active Windows API cannot lock its engine DLL.
  await checkPort(port, process.env.HOST || '0.0.0.0');
  if (process.argv.includes('--web')) await checkPort(5173, 'localhost');

  if (clientIsCurrent()) {
    console.info('Prisma Client is up to date; skipping generation.');
  } else {
    console.info('Prisma Client is missing or outdated; generating before startup.');
    const cli = resolve(dirname(apiRequire.resolve('prisma/package.json')), 'build/index.js');
    const result = spawnSync(process.execPath, [cli, 'generate'], {
      cwd: apiDir,
      env: process.env,
      stdio: 'inherit',
    });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  }
} catch (error) {
  console.error(`Development startup stopped: ${error.message}`);
  process.exitCode = 1;
}
