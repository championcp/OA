const request = require('supertest');
const app = require('./mock-server')();

describe('基础API测试', () => {
  test('GET /api/health-check 应返回200', async () => {
    const res = await request(app)
      .get('/api/health-check');
    expect(res.statusCode).toBe(200);
  });
});