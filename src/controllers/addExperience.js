import pool from "../models/db.js";

export const getAddExperience = (req, res) => {
  res.render("admin/add_work_experience");
};

export const postAddExperience = async (req, res) => {
  try {
    const { position, company, start_date, end_date, description, tech_used } = req.body;

    // Convert description jadi array (split per baris)
    let descriptionArray = [];
    if (typeof description === "string") {
      descriptionArray = description
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== "");
    } else if (Array.isArray(description)) {
      descriptionArray = description;
    }
    // Convert tech_used (checkbox) jadi array JSON
    const techUsedArray = Array.isArray(tech_used) ? tech_used : [tech_used];

    const image_url = req.imageUrl || null;

    await pool.query(
      `INSERT INTO work_experiences (position, company, start_date, end_date, description, tech_used, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        position,
        company,
        start_date,
        end_date,
        JSON.stringify(descriptionArray),
        JSON.stringify(techUsedArray),
        image_url
      ]
    );

    res.redirect("/");
  } catch (err) {
    console.error("❌ Gagal menambahkan pengalaman:", err);
    res.status(500).send("Terjadi kesalahan saat menambahkan pengalaman kerja.");
  }
};
