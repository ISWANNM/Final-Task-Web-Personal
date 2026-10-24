import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.VERCEL ? { rejectUnauthorized: true } : undefined,
    }
  : {
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      port: process.env.PGPORT,
    };

export const pool = new Pool(poolConfig);
  
export default pool;
