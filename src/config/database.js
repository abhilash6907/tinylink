import "dotenv/config";
import dns from "dns";
import pkg from "pg";

// Prefer IPv4 first to avoid ENETUNREACH/IPv6 attempts on some networks
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder("ipv4first");

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 20000,
  idleTimeoutMillis: 30000,
  max: 20,
});

export default pool;
