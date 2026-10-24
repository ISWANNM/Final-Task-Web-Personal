import bcrypt from "bcrypt";
import { pool } from "../models/db.js";

const { ADMIN_USERNAME: username, ADMIN_PASSWORD: password } = process.env;

if (!username || !password) {
  console.error("Set ADMIN_USERNAME and ADMIN_PASSWORD before creating an admin user.");
  await pool.end();
  process.exit(1);
}

try {
  const hashedPassword = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (username, password)
     VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password`,
    [username, hashedPassword]
  );
  console.log(`Admin user "${username}" created or updated.`);
} catch (error) {
  console.error("Failed to create admin user:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
