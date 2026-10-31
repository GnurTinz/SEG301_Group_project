import { app } from './app.js';
import { env } from './config/env.js';
import { db, sessionPool } from './lib/db.js';
const server = app.listen(env.PORT, '127.0.0.1', (error?: Error) => {
  if (error) {
    console.error('API startup failed', { code: (error as NodeJS.ErrnoException).code });
    process.exit(1);
  }
  console.info(`API listening on http://127.0.0.1:${env.PORT}`);
});
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () =>
    server.close(async () => {
      await db.$disconnect();
      await sessionPool.end();
      process.exit(0);
    }),
  );
