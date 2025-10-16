import  Router  from "express";
import getHome from "../controllers/homeController.js";

const router = Router();

// Route utama
router.get("/", getHome);

export default router;