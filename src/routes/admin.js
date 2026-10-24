import express from "express";
import pool from "../models/db.js";
import multer from "multer";
import path from "path";
import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { put } from "@vercel/blob";
import bcrypt from "bcrypt";
import { getAddProject } from "../controllers/addproject.js";
import { getAddExperience, postAddExperience } from "../controllers/addExperience.js";

const router = express.Router();

// === Setup __dirname untuk ES Modules ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ storage: multer.memoryStorage() });

const saveUploadedImage = async (file, directory) => {
  if (!file) {
    return null;
  }

  const filename = `${Date.now()}${path.extname(file.originalname)}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${directory}/${filename}`, file.buffer, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error("BLOB_READ_WRITE_TOKEN must be configured to upload images on Vercel.");
  }

  await writeFile(path.join(__dirname, "../../public/img", directory, filename), file.buffer);
  return `/img/${directory}/${filename}`;
};

const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    req.flash("error", "Silakan login terlebih dahulu.");
    return res.redirect("/admin/login");
  }

  next();
};

// === Login page ===
router.get("/login", (req, res) => {
  res.render("admin/login", { message: req.flash("error") });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];

    const passwordMatches = user
      ? user.password.startsWith("$2")
        ? await bcrypt.compare(password, user.password)
        : user.password === password
      : false;

    if (user && passwordMatches) {
      req.session.userId = user.id;
      res.redirect("/");
    } else {
      req.flash("error", "Invalid username or password");
      res.redirect("/admin/login");
    }
  } catch (err) {
    console.error("❌ Error during login:", err.message);
    req.flash("error", "Server error");
    res.redirect("/admin/login");
  }
});

// === Form tambah project ===
router.get("/add-project", requireLogin, getAddProject);

// === Proses tambah project + upload gambar ===
router.post("/add-project", requireLogin, upload.single("image"), async (req, res) => {
  try {
    const { name, description, link } = req.body;

    // Pastikan tech_stack selalu array (meskipun cuma 1 checkbox dipilih)
    const tech_stack = (Array.isArray(req.body.tech_stack)
      ? req.body.tech_stack
      : [req.body.tech_stack]
    ).filter(Boolean);

    // Simpan ke DB dalam format JSON string (agar mudah diambil lagi)
    const techStackJson = JSON.stringify(tech_stack);
    const image_url = await saveUploadedImage(req.file, "projects");

    await pool.query(
      `INSERT INTO projects (title, description, image_url, tech_stack, project_link)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, description, image_url, techStackJson, link]
    );

    console.log("✅ Project baru berhasil ditambahkan:", name, tech_stack);
    res.redirect("/");
  } catch (error) {
    console.error("❌ Gagal menambah project:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// work experience //
router.get("/add_work_experience", requireLogin, getAddExperience);
router.post(
  "/add_work_experience",
  requireLogin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      req.imageUrl = await saveUploadedImage(req.file, "experience");
      next();
    } catch (error) {
      next(error);
    }
  },
  postAddExperience
);

// === Logout ===
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Gagal logout:", err);
      return res.status(500).send("Logout gagal");
    }
    res.redirect("/");
  });
});



export default router;
