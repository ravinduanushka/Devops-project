const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

test('patients see only their IDs, cannot forge booking ownership, and clinical updates do not match names', async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017', {
    dbName: `privacy_test_${process.pid}_${Date.now()}`, serverSelectionTimeoutMS: 5000
  });
  let server;
  try {
    const app = require('./index');
    const User = mongoose.model('User'), Patient = mongoose.model('Patient');
    const models = ['Appointment', 'Prescription', 'AdmissionOrder'].map((name) => mongoose.model(name));
    const password = await bcrypt.hash('test-password', 4);
    const alice = await User.create({ name: 'Same Name', email: 'alice@privacy.test', role: 'Patient', phone: '123', password });
    const bob = await User.create({ name: 'Same Name', email: 'bob@privacy.test', role: 'Patient', phone: '456', password });
    const doctor = await User.create({ name: 'Test Doctor', email: 'doctor@privacy.test', role: 'Doctor', phone: '789', password });
    for (const id of [String(alice._id), String(bob._id), 'P-1042']) {
      await Patient.create({ name: 'Same Name', patientId: id, diagnosis: 'Unchanged' });
      for (const Model of models) await Model.create({ patientName: 'Same Name', patientId: id, doctorName: 'Test Doctor', tokenNumber: 1 });
    }
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (path, cookie, body) => fetch(base + path, { method: body ? 'POST' : 'GET',
      headers: { Cookie: cookie || '', 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
    const login = async (user) => (await request('/api/auth/login', '', { email: user.email, password: 'test-password' })).headers.get('set-cookie').split(';')[0];
    const aliceCookie = await login(alice), bobCookie = await login(bob), doctorCookie = await login(doctor);
    for (const [user, cookie] of [[alice, aliceCookie], [bob, bobCookie]]) {
      for (const path of ['/api/patients', '/api/appointments', '/api/prescriptions', '/api/admissions']) {
        const response = await request(`${path}?patientId=P-1042`, cookie);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        const rows = await response.json();
        assert.equal(rows.length, 1);
        assert(rows.every((row) => row.patientId === String(user._id)));
      }
    }
    const booking = await request('/api/appointments', aliceCookie, {
      patientId: String(bob._id), patientName: 'Bob', doctorName: 'Test Doctor', status: 'Completed'
    });
    assert.equal(booking.status, 201);
    const saved = await booking.json();
    assert.equal(saved.patientId, String(alice._id));
    assert.equal(saved.patientName, alice.name);
    assert.equal(saved.status, 'Waiting');
    const prescription = await request('/api/prescriptions', doctorCookie, {
      patientId: String(bob._id), patientName: 'Same Name', doctorName: 'Test Doctor', diagnosis: 'Bob diagnosis'
    });
    assert.equal(prescription.status, 201);
    assert.equal((await Patient.findOne({ patientId: String(alice._id) })).diagnosis, 'Unchanged');
    assert.equal((await Patient.findOne({ patientId: String(bob._id) })).diagnosis, 'Bob diagnosis');
    assert.equal((await (await request('/api/patients', doctorCookie)).json()).length, 3);
    const signup = await request('/api/auth/register', '', { name: 'New Patient', email: 'new@privacy.test', phone: '123',
      password: 'test-password', role: 'Patient', patientId: String(bob._id) });
    assert.equal(signup.status, 201);
    const newUser = await User.findOne({ email: 'new@privacy.test' });
    assert(await Patient.exists({ patientId: String(newUser._id) }));
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
