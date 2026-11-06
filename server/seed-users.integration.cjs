const { test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const seedUsers = require('./seed-users');

test('startup creates missing accounts and preserves existing passwords on repeated runs', async () => {
  const records = [];
  class User {
    constructor(data) { Object.assign(this, data); }
    async save() { if (!records.includes(this)) records.push(this); }
    static collection = { indexes: async () => [] };
    static async findOne(query) {
      return records.find((user) => user.role === query.role &&
        (!query.$or || query.$or.some((condition) => condition.name === user.name)));
    }
  }
  await seedUsers(User);
  assert.equal(records.length, 6);
  const doctor = records.find((user) => user.name === 'Dr. Vance');
  const receptionist = records.find((user) => user.role === 'Receptionist');
  assert(await bcrypt.compare(process.env.DOCTOR_VANCE_PASSWORD || 'vancedoctor', doctor.password));
  assert(await bcrypt.compare(process.env.RECEPTIONIST_PASSWORD || 'webreciption56', receptionist.password));
  doctor.password = await bcrypt.hash('changed-doctor-password', 4);
  receptionist.password = await bcrypt.hash('changed-receptionist-password', 4);
  const savedPasswords = records.map((user) => user.password);
  await seedUsers(User);
  await seedUsers(User);
  assert.equal(records.length, 6);
  assert.deepEqual(records.map((user) => user.password), savedPasswords);
  assert(await bcrypt.compare('changed-doctor-password', doctor.password));
  assert(await bcrypt.compare('changed-receptionist-password', receptionist.password));
  records.splice(records.findIndex((user) => user.name === 'Dr. Malani Fernando'), 1);
  await seedUsers(User);
  assert.equal(records.length, 6);
  assert.equal(doctor.password, savedPasswords[0]);
});
