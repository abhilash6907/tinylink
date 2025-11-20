import pool from "./db.js";

const fixTimezones = async () => {
  try {
    console.log("Converting timestamp columns to timestamptz...");
    
    // First, let's see what we have
    const checkQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'links' 
      AND column_name IN ('lastclicked', 'createdat');
    `;
    const { rows: currentSchema } = await pool.query(checkQuery);
    console.log("Current schema:", currentSchema);
    
    // Convert the columns - assuming they're currently in UTC
    const alterQuery = `
      ALTER TABLE links 
        ALTER COLUMN lastclicked TYPE TIMESTAMPTZ USING lastclicked AT TIME ZONE 'UTC',
        ALTER COLUMN createdat TYPE TIMESTAMPTZ USING createdat AT TIME ZONE 'UTC';
    `;
    
    await pool.query(alterQuery);
    console.log("✓ Columns converted to TIMESTAMPTZ successfully!");
    
    // Verify the change
    const { rows: newSchema } = await pool.query(checkQuery);
    console.log("New schema:", newSchema);
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
};

fixTimezones();
