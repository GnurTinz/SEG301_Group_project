import request from 'supertest';
import { app } from '../src/app.js';
export const agent = () => request.agent(app);
export type Agent = ReturnType<typeof agent>;
export async function csrfToken(a: Agent) {
  const r = await a.get('/api/v1/auth/csrf');
  if (r.status !== 200) throw new Error(`CSRF bootstrap failed: ${r.status}`);
  return r.body.data.csrfToken as string;
}
export async function login(username: string) {
  const a = agent();
  const t = await csrfToken(a);
  const r = await a
    .post('/api/v1/auth/login')
    .set('X-CSRF-Token', t)
    .send({ email: `${username}@demo.local`, password: process.env.DEMO_PASSWORD });
  if (r.status !== 200) throw new Error(`Login failed for ${username}: ${r.status}`);
  return { a, t: await csrfToken(a), user: r.body.data };
}
