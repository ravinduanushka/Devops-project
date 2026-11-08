const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cors = require('cors');
const createCorsOptions = require('./cors-options');

test('CORS enforces exact origins for requests and preflight', async () => {
  const app = express();
  app.use(cors(createCorsOptions('https://hospital.example, http://127.0.0.1:3000')));
  app.get('/test', (_req, res) => res.sendStatus(200));
  app.use((error, _req, res, _next) => res.status(error.status || 500).json({ error: error.message }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/test`;
  try {
    const allowed = await fetch(url, { headers: { Origin: 'https://hospital.example' } });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://hospital.example');
    assert.equal((await fetch(url)).status, 200);
    for (const origin of ['https://evil.example', 'https://hospital.example.evil.example', 'http://localhost:9999', 'null']) {
      const response = await fetch(url, { headers: { Origin: origin } });
      assert.equal(response.status, 403);
      assert.equal(response.headers.get('access-control-allow-origin'), null);
    }
    const preflight = await fetch(url, { method: 'OPTIONS', headers: {
      Origin: 'http://127.0.0.1:3000', 'Access-Control-Request-Method': 'POST'
    } });
    assert.equal(preflight.status, 204);
    const denied = await fetch(url, { method: 'OPTIONS', headers: {
      Origin: 'https://evil.example', 'Access-Control-Request-Method': 'POST'
    } });
    assert.equal(denied.status, 403);
    createCorsOptions('*').origin('https://evil.example', (error) => assert.equal(error.status, 403));
    createCorsOptions().origin('http://localhost:5173', (error, allowed) => {
      assert.equal(error, null);
      assert.equal(allowed, true);
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
