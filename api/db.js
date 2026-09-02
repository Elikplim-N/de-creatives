import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.dqsvorbxayyeywfkuern:personal1000cod-e@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

let pool;
if (!global._pgPool) {
  global._pgPool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}
pool = global._pgPool;

export default pool;
