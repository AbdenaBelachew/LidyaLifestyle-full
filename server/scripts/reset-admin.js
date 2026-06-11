/**
 * Reset or create the admin user with a known password.
 * Usage: node scripts/reset-admin.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const ADMIN_EMAIL = 'admin@lidya.com';
const ADMIN_PASSWORD = 'Admin@1234';

(async () => {
  try {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Check if admin user exists
    const existing = await query('SELECT id, role FROM users WHERE email = ?', [ADMIN_EMAIL]);

    if (existing.length > 0) {
      // Update existing user to ensure role=admin and reset password
      await query(
        'UPDATE users SET password_hash = ?, role = ?, is_active = true WHERE email = ?',
        [hash, 'admin', ADMIN_EMAIL]
      );
      console.log(`✅ Admin user updated successfully.`);
    } else {
      // Insert new admin user
      await query(
        'INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
        [ADMIN_EMAIL, hash, 'admin', 'Admin', 'Lidya']
      );
      console.log(`✅ Admin user created successfully.`);
    }

    console.log(`\n📧 Email:    ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log(`\nYou can now log in at /admin/login`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
