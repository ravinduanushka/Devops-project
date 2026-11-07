// Explicit operator command; never runs during application startup.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('./index');

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const name = (process.env.ADMIN_NAME || '').trim();
  const phone = (process.env.ADMIN_PHONE || '').trim();
  if (!email || !name || !phone || password.length < 12) {
    throw new Error('Set ADMIN_EMAIL, ADMIN_NAME, ADMIN_PHONE and ADMIN_PASSWORD (at least 12 characters)');
  }
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital');
    const User = mongoose.model('User');
    if (await User.exists({ email })) throw new Error('An account already uses this email; no account was changed');
    await User.create({ email, name, phone, role: 'Admin', password: await bcrypt.hash(password, 10) });
    console.log('Administrator account created');
  } finally { await mongoose.disconnect(); }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
