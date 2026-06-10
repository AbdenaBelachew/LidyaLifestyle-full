/**
 * Applies schema.sql to PostgreSQL.
 * Usage: node database/migrate.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const DB_NAME = process.env.DB_NAME || "lidya_lifestyle";

const COLUMN_PATCHES = [
  { table: "orders", column: "guest_email", sql: "ALTER TABLE orders ADD COLUMN guest_email VARCHAR(255)" },
  { table: "orders", column: "guest_name", sql: "ALTER TABLE orders ADD COLUMN guest_name VARCHAR(200)" },
  { table: "orders", column: "guest_phone", sql: "ALTER TABLE orders ADD COLUMN guest_phone VARCHAR(30)" },
  { table: "orders", column: "order_number", sql: "ALTER TABLE orders ADD COLUMN order_number VARCHAR(50) UNIQUE" },
];

async function columnExists(client, table, column) {
  const res = await client.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column]
  );
  return res.rows.length > 0;
}

async function tableExists(client, table) {
  const res = await client.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );
  return res.rows.length > 0;
}

async function main() {
  const admin = new Client({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: "postgres",
  });
  await admin.connect();
  const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);
  if (exists.rows.length === 0) {
    await admin.query(`CREATE DATABASE ${DB_NAME}`);
    console.log(`Created database ${DB_NAME}`);
  }
  await admin.end();

  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: DB_NAME,
  });
  await client.connect();

  const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const statements = schemaSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--"));

  console.log("Applying schema...");
  for (const stmt of statements) {
    try {
      await client.query(stmt);
      const label = stmt.slice(0, 50).replace(/\s+/g, " ");
      console.log(`  ok: ${label}...`);
    } catch (err) {
      if (err.code === "42P07" || err.code === "42710") {
        console.log(`  skip (exists): ${stmt.slice(0, 40).replace(/\s+/g, " ")}...`);
      } else {
        throw err;
      }
    }
  }

  console.log("Patching columns...");
  for (const patch of COLUMN_PATCHES) {
    if (!(await tableExists(client, patch.table))) continue;
    if (await columnExists(client, patch.table, patch.column)) {
      console.log(`  skip ${patch.table}.${patch.column} (exists)`);
      continue;
    }
    await client.query(patch.sql);
    console.log(`  added ${patch.table}.${patch.column}`);
  }

  if (await tableExists(client, "orders")) {
    try {
      await client.query("ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL");
      console.log("  orders.user_id is nullable (guest checkout)");
    } catch (err) {
      if (err.code !== "42704") console.log("  orders.user_id already nullable");
    }
  }

  await client.end();
  console.log("Migration complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
