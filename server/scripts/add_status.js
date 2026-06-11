require('dotenv').config();
const { query } = require('../config/db');

async function migrate() {
  try {
    console.log('Adding status column to products...');
    await query("ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Instock'");
    await query("UPDATE products SET status = 'Instock' WHERE status IS NULL");
    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
