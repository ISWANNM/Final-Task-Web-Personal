import pool from "../models/db.js";

export const getHome = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects ORDER BY id DESC");
    const experienceResult = await pool.query("SELECT * FROM work_experiences ORDER BY id DESC");
    
    
    const projects = result.rows.map((p) => {
      let techStackArray = [];

      try {
        if (typeof p.tech_stack === "string") {
          // Kalau string JSON (misal: '["HTML","CSS","JS"]')
          if (p.tech_stack.trim().startsWith("[")) {
            techStackArray = JSON.parse(p.tech_stack);
          } else {
            // Kalau masih format lama: "HTML, CSS, JS"
            techStackArray = p.tech_stack.split(",").map((t) => t.trim());
          }
        } else if (Array.isArray(p.tech_stack)) {
          techStackArray = p.tech_stack;
        }
      } catch (err) {
        console.warn("⚠️ Gagal parse tech_stack:", p.tech_stack);
        techStackArray = [];
      }

      return {
        ...p,
        tech_stack: techStackArray,
      };
    });

    const experiences = experienceResult.rows.map(exp => {
      let descriptionArray = [];

      // aman dari error JSON.parse
      try {
        if (typeof exp.description === "string") {
          descriptionArray = JSON.parse(exp.description.replace(/'/g, '"'));
        } else {
          descriptionArray = Array.isArray(exp.description) ? exp.description : [];
        }
      } catch (err) {
        // kalau gagal parse, fallback jadi array 1 elemen
        descriptionArray = [exp.description];
      }

      let techUsedArray = [];
      try {
        techUsedArray = Array.isArray(exp.tech_used)
          ? exp.tech_used
          : JSON.parse(exp.tech_used.replace(/'/g, '"'));
      } catch {
        techUsedArray = [];
      }

      return {
        ...exp,
        description: descriptionArray,
        tech_used: techUsedArray,
      };
    });


    res.render("home", { projects, experiences });
  } catch (error) {
    console.error(" Gagal ambil data :", error.message);
    res.status(500).send("Internal Server Error");
  }
};
