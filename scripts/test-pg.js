import 'dotenv/config';
import dns from 'dns';
import pkg from 'pg';
const { Pool } = pkg;

async function run() {
  const url = process.env.DATABASE_URL;
  console.log('DATABASE_URL:', url ? '[redacted]' : 'NOT SET');

  const hostMatch = url && url.match(/@([^:/?#]+)(?::\d+)?[/?]?/);
  const host = hostMatch ? hostMatch[1] : null;
  if (!host) {
    console.error('Could not parse host from DATABASE_URL');
    process.exit(2);
  }

  try {
    const addrs = await dns.promises.lookup(host, { all: true });
    console.log('DNS addresses:', addrs);
  } catch (err) {
    console.error('DNS lookup failed:', err);
  }

  import pool from "../src/config/database.js";
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log('Connected successfully (unexpected)');
    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('PG connect error:');
    console.error(err);
    await pool.end().catch(()=>{});
    process.exit(1);
  }
}

run();
