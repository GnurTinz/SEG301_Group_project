import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import dotenv from 'dotenv';
const names = spawnSync('git', ['diff', '--cached', '--name-only', '-z'], { encoding: 'utf8' });
if (names.status !== 0) throw new Error('Cannot inspect staged file list');
const files = names.stdout.split('\0').filter(Boolean);
const local = existsSync('.env') ? dotenv.parse(readFileSync('.env')) : {};
const secrets = [local.SESSION_SECRET, local.DEMO_PASSWORD];
if (local.DATABASE_URL) secrets.push(new URL(local.DATABASE_URL).password);
for (const file of files) {
  if (
    /(^|\/)(\.local|node_modules|dist|uploads|test-results)(\/|$)/.test(file) ||
    (/(^|\/)\.env($|\.)/.test(file) && file !== '.env.example')
  )
    throw new Error(`Generated/private file staged: ${file}`);
  const content = readFileSync(file, 'utf8');
  if (secrets.some((s) => s && s.length >= 12 && content.includes(s)))
    throw new Error(`Local secret appears in staged file: ${file}`);
  if (
    /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content) &&
    !file.endsWith('check-staged.mjs')
  )
    throw new Error(`Private key staged: ${file}`);
}
console.info(
  `Checked ${files.length} staged files: no private/generated paths or configured local secrets.`,
);
