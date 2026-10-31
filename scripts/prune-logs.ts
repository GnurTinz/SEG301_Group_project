import '../apps/api/src/config/env.js';
import { db, sessionPool } from '../apps/api/src/lib/db.js';
const setting = await db.setting.findUniqueOrThrow({ where: { key: 'logRetentionDays' } });
const days = Number(setting.valueJson);
if (!Number.isInteger(days) || days < 7 || days > 365)
  throw new Error('Invalid log retention setting');
const before = new Date(Date.now() - days * 86400000);
const counts = {
  searches: await db.searchClickLog.count({ where: { timestamp: { lt: before } } }),
  views: await db.documentView.count({ where: { viewedAt: { lt: before } } }),
};
console.info({
  before: before.toISOString(),
  ...counts,
  mode: process.argv.includes('--apply') ? 'apply' : 'dry-run',
});
if (process.argv.includes('--apply')) {
  // Operator-only maintenance; dry-run is the default. Publication/admin audit records are retained.
  await db.$transaction([
    db.searchClickLog.deleteMany({ where: { timestamp: { lt: before } } }),
    db.documentView.deleteMany({ where: { viewedAt: { lt: before } } }),
  ]);
}
await db.$disconnect();
await sessionPool.end();
