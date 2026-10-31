import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
describe('M1 infrastructure', () => {
  it('GET /health returns 200', async () => {
    const r = await request(app).get('/health');
    expect(r.status).toBe(200);
    expect(r.body.data.status).toBe('ok');
  });
});
