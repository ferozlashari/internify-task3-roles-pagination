// Creates (or promotes) the first admin account. Run with: npm run seed:admin
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  const { MONGO_URI, ADMIN_NAME = 'Admin', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Set MONGO_URI, ADMIN_EMAIL and ADMIN_PASSWORD in your .env file first.');
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGO_URI);
    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      existing.role = 'admin';
      await existing.save();
      console.log(`Existing user ${existing.email} is now an admin.`);
    } else {
      const admin = await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
      console.log(`Admin created: ${admin.email}`);
    }
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
