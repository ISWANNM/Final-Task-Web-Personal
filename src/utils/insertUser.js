import bcrypt from "bcrypt";
import { pool } from "../models/db.js";

async function insertUser() {
  try {
    const username = "admin"; // ubah sesuai kebutuhan
    const password = "admin123";

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert ke database
    const result = await pool.query(
      `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
      [username, hashedPassword]
    );

    console.log("✅ User berhasil ditambahkan:");
    console.log(result.rows[0]);
  } catch (err) {
    console.error("❌ Error saat insert user:", err.message);
  } finally {
    pool.end();
  }
}

insertUser();
