import express from "express";
import pool from "../db.js";

const router = express.Router();

const selectLinksQuery =
  'SELECT code, longurl AS "longURL", clicks, createdat AS "createdAt", lastclicked AS "lastClicked" FROM links ORDER BY createdat DESC';

router.get("/healthz", (req, res) => {
  res.json({ ok: true, version: "1.0" });
});

router.get("/", async (req, res, next) => {
  try {
    const { rows: links } = await pool.query(selectLinksQuery);
    res.render("dashboard", {
      links,
      message: req.query.message || null,
      error: req.query.error || null,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/code/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { rows } = await pool.query(
      'SELECT code, longurl AS "longURL", clicks, createdat AS "createdAt", lastclicked AS "lastClicked" FROM links WHERE code = $1',
      [code]
    );
    const link = rows[0];
    if (!link) {
      return res.status(404).render("stats", { link: null });
    }
    return res.render("stats", { link });
  } catch (error) {
    return next(error);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const updateQuery =
      "UPDATE links SET clicks = clicks + 1, lastclicked = NOW() WHERE code = $1 RETURNING longurl";
    const { rows } = await pool.query(updateQuery, [code]);
    const link = rows[0];
    if (!link) {
      return res.status(404).send("Short link not found.");
    }
    return res.redirect(link.longurl);
  } catch (error) {
    return next(error);
  }
});

export default router;
