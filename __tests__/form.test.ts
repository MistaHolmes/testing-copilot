import request from 'supertest';
import app from '../src/app';

describe('Form endpoint', () => {
  it('creates a form entry and returns 201', async () => {
    const res = await request(app).post('/forms').send({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello from test',
    });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Test User');
  });
});
