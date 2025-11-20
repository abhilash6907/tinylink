import net from "net";
import tls from "tls";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const url = new URL(connectionString);
const host = url.hostname;
const port = url.port || 5432;

console.log(`Diagnosing connection to ${host}:${port}...`);

async function testTcp() {
  return new Promise((resolve, reject) => {
    console.log("1. Testing raw TCP connection...");
    const socket = new net.Socket();
    socket.setTimeout(5000);
    
    socket.connect({ port, host, family: 4 }, () => {
      console.log("   [SUCCESS] TCP connection established.");
      socket.end();
      resolve(true);
    });

    socket.on("timeout", () => {
      console.log("   [FAILED] TCP connection timed out.");
      socket.destroy();
      resolve(false);
    });

    socket.on("error", (err) => {
      console.log(`   [FAILED] TCP connection error: ${err.message}`);
      console.log(err);
      resolve(false);
    });
  });
}

async function testTls() {
  return new Promise((resolve, reject) => {
    console.log("2. Testing TLS/SSL connection...");
    const socket = tls.connect(port, host, { rejectUnauthorized: false, timeout: 5000, family: 4 }, () => {
      console.log("   [SUCCESS] TLS connection established.");
      socket.end();
      resolve(true);
    });

    socket.on("timeout", () => {
      console.log("   [FAILED] TLS connection timed out.");
      socket.destroy();
      resolve(false);
    });

    socket.on("error", (err) => {
      console.log(`   [FAILED] TLS connection error: ${err.message}`);
      console.log(err);
      resolve(false);
    });
  });
}

async function testPg() {
  console.log("3. Testing pg library connection...");
  const { Pool } = pg;
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log("   [SUCCESS] PG client connected.");
    const res = await client.query("SELECT NOW()");
    console.log(`   [SUCCESS] Query result: ${res.rows[0].now}`);
    client.release();
  } catch (err) {
    console.log(`   [FAILED] PG connection error: ${err.message}`);
  } finally {
    await pool.end();
  }
}

(async () => {
  const tcpSuccess = await testTcp();
  if (tcpSuccess) {
    const tlsSuccess = await testTls();
    if (tlsSuccess) {
      await testPg();
    }
  }
})();
