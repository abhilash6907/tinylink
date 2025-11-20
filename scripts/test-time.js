import pool from "../src/config/database.js";

const test = async () => {
  const {rows} = await pool.query('SELECT code, lastclicked, pg_typeof(lastclicked) as type FROM links LIMIT 1');
  console.log('Database value:', rows[0]);
  console.log('IST:', rows[0].lastclicked ? new Date(rows[0].lastclicked).toLocaleString("en-IN", {timeZone: "Asia/Kolkata", dateStyle: 'short', timeStyle: 'medium'}) : "null");
  await pool.end();
};

test();
