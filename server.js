import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts";
import pagesRouter from "./src/routes/pages.js";
import apiRouter from "./src/routes/api.js";
import pool from "./src/config/database.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layout");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "src/public")));

app.use((req, res, next) => {
  res.locals.baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  next();
});

app.use("/", pagesRouter);
app.use("/api", apiRouter);

app.use(errorHandler);

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
