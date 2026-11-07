const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

test('real API enforces clinical role matrix and admin-only staff registration', async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017', {
    dbName: `permissions_test_${process.pid}_${Date.now()}`, serverSelectionTimeoutMS: 5000
  });
  let server;
  try {
    const app = require('./index');
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (path, method, body, cookie = '') => fetch(base + path, {
      method, headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(body)
    });
    const User = mongoose.model('User');
    const roles = ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient'];
    const cookies = {};
    for (const role of roles) {
      const email = `${role.toLowerCase()}@permissions.test`;
      await User.create({ email, role, name: `${role} Example`, phone: '123', password: await bcrypt.hash('test-password', 4) });
      const response = await request('/api/auth/login', 'POST', { email, password: 'test-password' });
      assert.equal(response.status, 200);
      cookies[role] = response.headers.get('set-cookie').split(';')[0];
    }
    const id = new mongoose.Types.ObjectId().toString();
    const actions = [
      ['/api/patients', 'POST', ['Admin', 'Receptionist']],
      [`/api/patients/${id}`, 'PUT', ['Admin', 'Doctor', 'Nurse', 'Receptionist']],
      ['/api/appointments', 'POST', ['Admin', 'Receptionist', 'Patient']],
      [`/api/appointments/${id}`, 'PUT', ['Admin', 'Doctor', 'Receptionist']],
      ['/api/prescriptions', 'POST', ['Admin', 'Doctor']],
      [`/api/prescriptions/${id}`, 'PUT', ['Admin', 'Doctor', 'Nurse']],
      ['/api/admissions', 'POST', ['Admin', 'Doctor']],
      [`/api/admissions/${id}`, 'PUT', ['Admin', 'Doctor', 'Receptionist', 'Nurse']]
    ];
    for (const [path, method, allowed] of actions) {
      const body = { name: 'Test Patient', patientName: 'Test Patient', doctorName: 'Doctor Example', status: 'Waiting' };
      assert.equal((await request(path, method, body)).status, 401);
      for (const role of roles) {
        const response = await request(path, method, body, cookies[role]);
        assert.equal(response.status, allowed.includes(role) ? (method === 'POST' ? 201 : 200) : 403, `${role} ${method} ${path}`);
      }
    }
    const Patient = mongoose.model('Patient');
    const admitted = await Patient.create({ name: 'Ward Clearing Test', patientId: 'ward-test', wardNumber: 'Ward A', status: 'Discharge Approved' });
    const cleared = await fetch(`${base}/api/patients/${admitted._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: cookies.Receptionist },
      body: JSON.stringify({ status: 'Discharged', wardNumber: '' })
    });
    assert.equal(cleared.status, 200);
    assert.equal((await Patient.findById(admitted._id)).wardNumber, '');
    let count = 0;
    const registration = (role) => ({ role, name: `New User ${count}`, email: `new${count++}@permissions.test`, phone: '123', password: 'test-password' });
    for (const role of roles.filter((r) => r !== 'Patient')) {
      const body = registration(role);
      assert.equal((await request('/api/auth/register', 'POST', body)).status, 401);
      for (const caller of roles.filter((r) => r !== 'Admin')) {
        assert.equal((await request('/api/auth/register', 'POST', body, cookies[caller])).status, 403);
      }
      assert.equal(await User.countDocuments({ email: body.email }), 0);
      assert.equal((await request('/api/auth/register', 'POST', body, cookies.Admin)).status, 201);
    }
    assert.equal((await request('/api/auth/register', 'POST', registration('Patient'))).status, 201);
    assert.equal((await request('/api/auth/register', 'POST', registration('Superuser'))).status, 400);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
