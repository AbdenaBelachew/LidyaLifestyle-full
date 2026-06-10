/**
 * Runs seed.sql if the database has no products yet.
 * Usage: node database/seed.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "lidya_lifestyle",
  });
  await client.connect();

  const countRes = await client.query("SELECT COUNT(*)::int AS count FROM products");
  if (countRes.rows[0].count > 0) {
    console.log("Seed skipped — products already exist.");
    await client.end();
    return;
  }

  const seedSql = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");
  const statements = seedSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--") && !/^\\c /i.test(s));

  for (const stmt of statements) {
    try {
      await client.query(stmt);
      console.log("Executed:", stmt.slice(0, 50).replace(/\s+/g, " ") + "...");
    } catch (err) {
      if (err.code === "23505") {
        console.log("Skipped duplicate:", stmt.slice(0, 50).replace(/\s+/g, " "));
      } else {
        throw err;
      }
    }
  }

  const after = await client.query("SELECT COUNT(*)::int AS count FROM products");
  await client.end();
  console.log(`Seed complete. Products: ${after.rows[0].count}`);
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
