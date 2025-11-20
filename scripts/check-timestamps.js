import pool from "../src/config/database.js";

const checkTimestamps = async () => {
  try {
    console.log("Checking timestamp data...\n");
    
    const { rows } = await pool.query(`
      SELECT code, lastclicked, 
             lastclicked AT TIME ZONE 'UTC' as utc_time,
             NOW() as db_now,
             NOW() AT TIME ZONE 'UTC' as db_now_utc
      FROM links 
      ORDER BY createdat DESC 
      LIMIT 3
    `);
    
    console.log("Database rows:");
    rows.forEach(row => {
      console.log("\nCode:", row.code);
      console.log("Raw lastclicked:", row.lastclicked);
      console.log("UTC time:", row.utc_time);
      console.log("DB NOW():", row.db_now);
      console.log("DB NOW() UTC:", row.db_now_utc);
      console.log("JavaScript conversion:", row.lastclicked ? new Date(row.lastclicked).toLocaleString() : "null");
    });
    
    console.log("\n\nLocal system info:");
    console.log("Node TZ:", process.env.TZ || "not set");
    console.log("JS Date now:", new Date().toLocaleString());
    console.log("JS Date UTC:", new Date().toUTCString());
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
};

checkTimestamps();
