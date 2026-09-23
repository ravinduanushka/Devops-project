const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP' });
});

describe('GET /health', () => {
  it('should return 200 OK and status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'UP');
  });
});