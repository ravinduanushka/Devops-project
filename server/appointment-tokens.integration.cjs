const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const allocate = require('./appointment-tokens');

test('tokens continue above existing records and remain unique under concurrency', async () => {
  const connection = await mongoose.createConnection(
    process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017',
    { dbName: `token_test_${process.pid}_${Date.now()}`, serverSelectionTimeoutMS: 5000 }
  ).asPromise();
  try {
    const Appointment = connection.model('Appointment', new mongoose.Schema({ tokenNumber: Number }));
    const Counter = connection.model('Counter', new mongoose.Schema({ _id: String, sequence: Number }));
    await Appointment.create({ tokenNumber: 42 });
    const tokens = await Promise.all(Array.from({ length: 30 }, () => allocate(Appointment, Counter)));
    assert.equal(new Set(tokens).size, 30);
    assert.deepEqual(tokens.sort((a, b) => a - b), Array.from({ length: 30 }, (_, i) => i + 43));
    assert.equal(await allocate(Appointment, Counter), 73);
    await Appointment.create({ tokenNumber: 100 });
    assert.equal(await allocate(Appointment, Counter), 101);
  } finally {
    // Only this test's newly created, isolated database is removed.
    await connection.dropDatabase();
    await connection.close();
  }
});
