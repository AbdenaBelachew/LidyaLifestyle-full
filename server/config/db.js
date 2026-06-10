const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "lidya_lifestyle",
});

function convertPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function isInsert(sql) {
  const t = sql.trim();
  return /^INSERT\s+/i.test(t) && !/RETURNING\s+/i.test(t) && !/^INSERT\s+INTO\s+\w+\s*\([^)]*\)\s*SELECT/i.test(t);
}

async function query(sql, params = []) {
  let text = sql.trim();
  if (isInsert(text)) text += " RETURNING id";
  const result = await pool.query(convertPlaceholders(text), params);
  if (isInsert(sql)) {
    const rows = result.rows;
    rows.insertId = rows[0]?.id;
    return rows;
  }
  return result.rows;
}

async function getConnection() {
  const client = await pool.connect();
  return {
    execute: async (sql, params = []) => {
      let text = sql.trim();
      const insert = isInsert(text);
      if (insert) text += " RETURNING id";
      const result = await client.query(convertPlaceholders(text), params);
      if (insert) {
        return [{ insertId: result.rows[0]?.id }, result.rows];
      }
      return [result.rows, result.fields || []];
    },
    beginTransaction: () => client.query("BEGIN"),
    commit: () => client.query("COMMIT"),
    rollback: () => client.query("ROLLBACK"),
    release: () => client.release(),
  };
}

module.exports = { pool, query, getConnection };
