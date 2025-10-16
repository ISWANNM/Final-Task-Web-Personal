import express from "express";
import pool from "../models/db.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { getAddProject } from "../controllers/addproject.js";
import { getAddExperience, postAddExperience } from "../controllers/addExperience.js";

const router = express.Router();

// === Setup __dirname untuk ES Modules ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Konfigurasi multer untuk upload gambar ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // simpan ke src/public/img/projects/
    cb(null, path.join(__dirname, "../public/img/projects"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// === Login page ===
router.get("/login", (req, res) => {
  res.render("admin/login", { message: req.flash("error") });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];

    if (user && user.password === password) {
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
router.get("/add-project", getAddProject);

// === Proses tambah project + upload gambar ===
router.post("/add-project", upload.single("image"), async (req, res) => {
  try {
    const { name, description, link } = req.body;

    // Pastikan tech_stack selalu array (meskipun cuma 1 checkbox dipilih)
    let tech_stack = req.body.tech_stack;
    if (!Array.isArray(tech_stack)) {
      tech_stack = [tech_stack];
    }

    // Simpan ke DB dalam format JSON string (agar mudah diambil lagi)
    const techStackJson = JSON.stringify(tech_stack);
    const image_url = req.file ? `/img/projects/${req.file.filename}` : null;

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
const storageExperience = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/img/experience"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const uploadExperience = multer({ storage: storageExperience });

router.get("/add_work_experience", getAddExperience);
router.post("/add_work_experience", uploadExperience.single("image"), postAddExperience);

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
