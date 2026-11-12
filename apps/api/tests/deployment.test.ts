import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

// Import the real app after selecting production settings, including Secure cookies.
vi.stubEnv('NODE_ENV', 'production');
vi.stubEnv('DATABASE_URL', process.env.DATABASE_URL!.replace(/^postgresql:/, 'postgres:'));
vi.stubEnv('WEB_ORIGIN', 'https://portal.example.com');
vi.stubEnv('TRUST_PROXY', '1');
vi.stubEnv('RENDER_API_ORIGIN', 'https://portal-api.onrender.com');
const { app } = await import('../src/app.js');
const { db, sessionPool } = await import('../src/lib/db.js');
const { sessionStore } = await import('../src/middleware/security.js');
const { envSchema } = await import('../src/config/env.js');
const { config } = await import('../../../vercel.js');

const httpsGet = (path: string) => request(app).get(path).set('X-Forwarded-Proto', 'https');
const cookieFrom = (response: request.Response) => {
  const cookies = response.headers['set-cookie'] as unknown as string[];
  expect(cookies).toHaveLength(1);
  expect(cookies[0]).toMatch(/; HttpOnly/);
  expect(cookies[0]).toMatch(/; Secure/);
  expect(cookies[0]).toMatch(/; SameSite=Lax/);
  expect(cookies[0]).not.toMatch(/; Domain=/i);
  return cookies[0]!.split(';')[0]!;
};

describe('Vercel / Render production deployment', () => {
  beforeAll(async () => {
    await db.$connect();
  });

  it('supports Render database URLs and rejects unsafe production configuration', () => {
    const values = { ...process.env, DATABASE_URL: 'postgres://portal:example@localhost/portal' };
    expect(envSchema.parse(values).HOST).toBe('0.0.0.0');
    for (const WEB_ORIGIN of [
      'http://portal.example.com',
      'https://portal.example.com/',
      'https://portal.example.com/login',
    ])
      expect(envSchema.safeParse({ ...values, WEB_ORIGIN }).success).toBe(false);
    expect(envSchema.safeParse({ ...values, TRUST_PROXY: 'true' }).success).toBe(false);
    expect(
      envSchema.safeParse({ ...values, DATABASE_URL: 'mysql://localhost/portal' }).success,
    ).toBe(false);
    expect(envSchema.safeParse({ ...values, DATABASE_URL: 'invalid' }).success).toBe(false);
    expect(envSchema.safeParse({ ...values, WEB_ORIGIN: 'invalid' }).success).toBe(false);
  });

  it('checks database readiness without exposing failures', async () => {
    expect((await httpsGet('/health/ready')).body.data.status).toBe('ready');
    const query = vi
      .spyOn(db, '$queryRaw')
      .mockRejectedValueOnce(new Error('private database details'));
    try {
      const response = await httpsGet('/health/ready');
      expect(response.status).toBe(503);
      expect(response.body.error.code).toBe('NOT_READY');
      expect(response.text).not.toContain('private');
    } finally {
      query.mockRestore();
    }
  });

  it('keeps Secure cookie login, rotation, CSRF and logout working behind TLS termination', async () => {
    const bootstrap = await httpsGet('/api/v1/auth/csrf');
    expect(bootstrap.status).toBe(200);
    expect(bootstrap.headers['cache-control']).toBe('no-store');
    const anonymousCookie = cookieFrom(bootstrap);
    const mutation = (cookie: string, token: string, origin = 'https://portal.example.com') =>
      request(app)
        .post('/api/v1/auth/login')
        .set('X-Forwarded-Proto', 'https')
        .set('Origin', origin)
        .set('Cookie', cookie)
        .set('X-CSRF-Token', token)
        .send({ email: 'user@demo.local', password: process.env.DEMO_PASSWORD });
    expect(
      (await mutation(anonymousCookie, bootstrap.body.data.csrfToken, 'https://attacker.example'))
        .status,
    ).toBe(403);
    expect((await mutation(anonymousCookie, 'invalid-token')).status).toBe(403);
    const signedIn = await mutation(anonymousCookie, bootstrap.body.data.csrfToken);
    expect(signedIn.status).toBe(200);
    const cookie = cookieFrom(signedIn);
    expect(cookie).not.toBe(anonymousCookie);
    expect((await httpsGet('/api/v1/auth/me').set('Cookie', cookie)).status).toBe(200);
    const freshToken = await httpsGet('/api/v1/auth/csrf').set('Cookie', cookie);
    const logout = await request(app)
      .post('/api/v1/auth/logout')
      .set('X-Forwarded-Proto', 'https')
      .set('Origin', 'https://portal.example.com')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', freshToken.body.data.csrfToken)
      .send({});
    expect(logout.status).toBe(200);
    expect((await httpsGet('/api/v1/auth/me').set('Cookie', cookie)).status).toBe(401);
    expect((await httpsGet('/api/v1/auth/me').set('Cookie', anonymousCookie)).status).toBe(401);
  });

  it('does not issue a production session cookie over plain HTTP', async () => {
    const response = await request(app).get('/api/v1/auth/csrf');
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('resolves the configured API origin before the SPA fallback and disables API caching', () => {
    expect(config.outputDirectory).toBe('apps/web/dist');
    expect(config.rewrites?.slice(0, 3)).toEqual([
      { source: '/api/:path*', destination: 'https://portal-api.onrender.com/api/:path*' },
      { source: '/uploads/:path*', destination: 'https://portal-api.onrender.com/uploads/:path*' },
      { source: '/health/:path*', destination: 'https://portal-api.onrender.com/health/:path*' },
    ]);
    const fallback = config.rewrites?.at(-1);
    expect(fallback?.destination).toBe('/index.html');
    const source = new RegExp(`^${fallback!.source}$`);
    for (const path of ['/login', '/articles/example', '/admin/articles/123/edit'])
      expect(source.test(path)).toBe(true);
    for (const path of [
      '/api/v1/no-such-route',
      '/uploads/missing.png',
      '/health/ready',
      '/assets/app.js',
      '/covers/network.svg',
    ])
      expect(source.test(path)).toBe(false);
    expect(config.headers?.[0]?.headers).toContainEqual({
      key: 'x-vercel-enable-rewrite-caching',
      value: '0',
    });
  });
});

afterAll(async () => {
  sessionStore.close();
  await db.$disconnect();
  await sessionPool.end();
  vi.unstubAllEnvs();
});
