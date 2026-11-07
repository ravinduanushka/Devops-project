const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

test('medication administration verifies role and patient, saves one item and preserves its first audit', async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017', {
    dbName: `medications_test_${process.pid}_${Date.now()}`, serverSelectionTimeoutMS: 5000
  });
  let server;
  try {
    const app = require('./index');
    const User = mongoose.model('User'), Prescription = mongoose.model('Prescription');
    const cookies = {}, users = {};
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (path, method, body, cookie = '') => fetch(base + path, {
      method, headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(body)
    });
    for (const role of ['Nurse', 'Doctor', 'Patient', 'Admin']) {
      users[role] = await User.create({ name: `${role} Test`, role, email: `${role}@medications.test`, phone: '123', password: await bcrypt.hash('test-password', 4) });
      const login = await request('/api/auth/login', 'POST', { email: users[role].email, password: 'test-password' });
      cookies[role] = login.headers.get('set-cookie').split(';')[0];
    }
    const created = await request('/api/prescriptions', 'POST', { patientName: 'Patient Test', patientId: 'patient-id', doctorName: 'Doctor Test',
      medications: [{ name: 'Medicine A', administeredAt: new Date(), administeredByName: 'Forged' }, { name: 'Medicine B' }] }, cookies.Doctor);
    assert.equal(created.status, 201);
    const prescription = await created.json();
    assert.equal(prescription.medications[0].administeredAt, null);
    const path = `/api/prescriptions/${prescription._id}/medications/${prescription.medications[0]._id}`;
    assert.equal((await request(path, 'PUT', { patientId: 'patient-id' })).status, 401);
    for (const role of ['Patient', 'Doctor']) assert.equal((await request(path, 'PUT', { patientId: 'patient-id' }, cookies[role])).status, 403);
    assert.equal((await request(path, 'PUT', { patientId: 'other-patient' }, cookies.Nurse)).status, 400);
    assert.equal((await request('/api/prescriptions/invalid/medications/invalid', 'PUT', {}, cookies.Nurse)).status, 400);
    const given = await request(path, 'PUT', { patientId: 'patient-id', administeredByName: 'Forged' }, cookies.Nurse);
    assert.equal(given.status, 200);
    const saved = await given.json();
    assert.equal(saved.medications[0].administeredBy, String(users.Nurse._id));
    assert.equal(saved.medications[0].administeredByName, users.Nurse.name);
    assert(saved.medications[0].administeredAt);
    assert.equal(saved.medications[1].administeredAt, null);
    assert.equal(saved.status, 'Pending Dispensing');
    const repeated = await request(path, 'PUT', { patientId: 'patient-id' }, cookies.Admin);
    assert.deepEqual((await repeated.json()).medications, saved.medications);
    const missing = `/api/prescriptions/${prescription._id}/medications/${new mongoose.Types.ObjectId()}`;
    assert.equal((await request(missing, 'PUT', { patientId: 'patient-id' }, cookies.Nurse)).status, 404);
    assert.equal((await Prescription.findById(prescription._id)).medications[1].administeredAt, null);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
