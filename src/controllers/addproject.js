import pool from "../models/db.js";  // Import koneksi PostgreSQL

// === GET /admin/add_project ===
export const getAddProject = async (req, res) => {
  res.render("admin/add_project");
}

// === POST /admin/add-project ===
export const postAddProject = async (req, res) => {
  try {
    const { name: title, description, link: project_link, tech_stack } = req.body;

    const techStackArray = Array.isArray(tech_stack) ? tech_stack : [tech_stack];

    // Gambar project
    const image_url = req.file ? `/img/projects/${req.file.filename}` : null;

    // Validasi wajib
    if (!title || !description) {
      req.flash("messages", "Title dan description wajib diisi!");
      return res.redirect("/admin/add-project");
    }

    const user_id = req.session.userId || 1;

    // Simpan data ke database
    await pool.query(
      `INSERT INTO projects (title, description, image_url, tech_stack, project_link, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        title,
        description,
        image_url,
        JSON.stringify(techStackArray), // array disimpan sebagai JSON
        project_link,
        user_id
      ]
    );

    req.flash("messages", "Project berhasil ditambahkan!");
    res.redirect("/");
  } catch (error) {
    console.error("❌ Error in postAddProject:", error);
    req.flash("messages", "Terjadi error saat menambahkan project.");
    res.redirect("/admin/add-project");
  }
};


