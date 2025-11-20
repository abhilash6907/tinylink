import pool from "../src/config/database.js";

const migrateTimestamps = async () => {
  try {
    console.log("Migrating timestamp columns to TIMESTAMPTZ...");
    
    await pool.query(`
      ALTER TABLE links 
      ALTER COLUMN lastClicked TYPE TIMESTAMPTZ USING lastClicked AT TIME ZONE 'UTC',
      ALTER COLUMN createdAt TYPE TIMESTAMPTZ USING createdAt AT TIME ZONE 'UTC';
    `);
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await pool.end();
  }
};

migrateTimestamps();
