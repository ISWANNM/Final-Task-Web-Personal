import pool from "../models/db.js";
import { getGithubProjects } from "../services/githubProjects.js";

export const getHome = async (req, res) => {
  try {
    const [projectResult, experienceResult, githubProjects] = await Promise.all([
      pool.query("SELECT * FROM projects ORDER BY id DESC"),
      pool.query("SELECT * FROM work_experiences ORDER BY id DESC"),
      getGithubProjects(),
    ]);

    const savedProjects = projectResult.rows.map((project) => {
      let techStack = [];

      try {
        if (Array.isArray(project.tech_stack)) {
          techStack = project.tech_stack;
        } else if (typeof project.tech_stack === "string") {
          techStack = project.tech_stack.trim().startsWith("[")
            ? JSON.parse(project.tech_stack)
            : project.tech_stack.split(",").map((technology) => technology.trim());
        }
      } catch (error) {
        console.warn("Gagal membaca tech_stack project:", error.message);
      }

      return { ...project, tech_stack: techStack };
    });
    const projects = [...savedProjects, ...githubProjects];

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
