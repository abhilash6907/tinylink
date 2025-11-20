import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts";
import pagesRouter from "./routes/pages.js";
import apiRouter from "./routes/api.js";
import pool from "./db.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layout");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  next();
});

app.use("/", pagesRouter);
app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  if (req.accepts("html")) {
    return res.status(status).send(err.message || "Internal Server Error");
  }
  return res.status(status).json({ success: false, message: err.message || "Internal Server Error" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`TinyLink server listening on port ${port}`);
  
  // Test database connection
  pool.query("SELECT NOW()")
    .then(() => console.log("Database connected successfully"))
    .catch((err) => {
      console.error("Database connection failed details:");
      console.error(err);
    });
});
