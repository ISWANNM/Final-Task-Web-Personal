import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import hbs from "hbs";
import ExpressHandlebars from "express-handlebars";
import session from "express-session";
import flash from "connect-flash";

import adminRoutes from "./routes/admin.js";
import { getHome } from "./controllers/homeController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// === Setup Handlebars ===
app.engine(
  "hbs",
  ExpressHandlebars.engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    helpers: {
      split: (text, delimiter) => {
        if (!text) return [];
        return text.split(delimiter).map((t) => t.trim());
      },
    },
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "views/partials"));

// === Middleware ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use("/img", express.static(path.join(__dirname, "..", "public", "img")));
app.use(express.static(path.join(__dirname, "..", "public")));

// === Session & Flash ===
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

// === Set variabel global  ===
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.userId;
  res.locals.userId = req.session.userId || null;
  res.locals.flash = req.flash();
  next();
});

// === Routes ===
app.get("/", getHome);
app.use("/admin", adminRoutes);

export default app;

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  );
}
