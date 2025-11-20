import pool from "../src/config/database.js";

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS links (
    code TEXT PRIMARY KEY,
    longURL TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    lastClicked TIMESTAMPTZ,
    createdAt TIMESTAMPTZ DEFAULT NOW()
  );
`;

const setup = async () => {
  try {
    console.log("Creating table 'links'...");
    await pool.query(createTableQuery);
    console.log("Table created successfully.");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    await pool.end();
  }
};

setup();
