const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

test('actual API verifies, rotates, expires and revokes login sessions', async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017', {
    dbName: `auth_test_${process.pid}_${Date.now()}`, serverSelectionTimeoutMS: 5000
  });
  let server;
  try {
    const app = require('./index');
    const User = mongoose.model('User'), Session = mongoose.model('Session');
    await Session.init();
    const user = await User.create({ email: 'session@example.test', password: await bcrypt.hash('test-password', 4),
      name: 'Session Test', phone: '123', role: 'Patient' });
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const request = (path, options) => fetch(`http://127.0.0.1:${server.address().port}${path}`, options);
    const login = (password = 'test-password', cookie = '') => request('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ email: user.email, password })
    });
    const me = (cookie) => request('/api/auth/me', { headers: { Cookie: cookie } });
    for (const path of ['/api/auth/me', '/api/patients', '/api/appointments', '/api/prescriptions', '/api/admissions']) {
      assert.equal((await request(path)).status, 401);
    }
    assert.equal((await login('wrong')).status, 401);
    assert.equal(await Session.countDocuments(), 0);
    const response = await login();
    assert.equal(response.status, 200);
    const header = response.headers.get('set-cookie');
    assert.match(header, /HttpOnly/i);
    assert.match(header, /SameSite=Lax/i);
    const cookie = header.split(';')[0];
    assert.notEqual((await Session.findOne()).tokenHash, cookie.split('=')[1]);
    assert.equal((await response.json()).password, undefined);
    assert.equal((await (await me(cookie)).json()).userId, String(user._id));
    assert.equal((await request('/api/appointments', { headers: { Cookie: cookie } })).status, 200);
    assert.equal((await me('hospital_session=' + 'a'.repeat(64))).status, 401);
    assert.equal((await me('hospital_session=malformed')).status, 401);
    const rotated = await login('test-password', cookie);
    const nextCookie = rotated.headers.get('set-cookie').split(';')[0];
    assert.notEqual(nextCookie, cookie);
    assert.equal((await me(cookie)).status, 401);
    assert.equal((await request('/api/auth/logout', { method: 'POST', headers: { Cookie: nextCookie } })).status, 204);
    assert.equal((await me(nextCookie)).status, 401);
    const expiredCookie = (await login()).headers.get('set-cookie').split(';')[0];
    await Session.updateMany({}, { expiresAt: new Date(0) });
    assert.equal((await me(expiredCookie)).status, 401);
    const removedCookie = (await login()).headers.get('set-cookie').split(';')[0];
    await User.deleteOne({ _id: user._id });
    assert.equal((await me(removedCookie)).status, 401);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
