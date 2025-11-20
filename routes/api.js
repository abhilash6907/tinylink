import express from "express";
import pool from "../db.js";

const router = express.Router();
const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;
const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateRandomCode = (length = 6) => {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
  }
  return code;
};

const validateUrl = (value = "") => {
  try {
    const parsed = new URL(value);
    return Boolean(parsed.protocol && parsed.hostname);
  } catch {
    return false;
  }
};

const getLinkByCode = async (code) => {
  const { rows } = await pool.query(
    'SELECT code, longurl AS "longURL", clicks, createdat AS "createdAt", lastclicked AS "lastClicked" FROM links WHERE code = $1',
    [code]
  );
  return rows[0];
};

const createUniqueCode = async () => {
  for (let i = 0; i < 5; i += 1) {
    const candidate = generateRandomCode(6 + (i % 3));
    const existing = await getLinkByCode(candidate);
    if (!existing) {
      return candidate;
    }
  }
  throw new Error("Unable to generate unique code. Please provide one manually.");
};

router.post("/links", async (req, res, next) => {
  try {
    let { longURL, code } = req.body;
    if (!longURL || !validateUrl(longURL.trim())) {
      return res.status(400).json({ success: false, message: "Please provide a valid URL." });
    }

    longURL = longURL.trim();

    if (code && !CODE_REGEX.test(code)) {
      return res.status(400).json({ success: false, message: "Code must be 6-8 alphanumeric characters." });
    }

    if (!code) {
      code = await createUniqueCode();
    }

    const existing = await getLinkByCode(code);
    if (existing) {
      return res.status(409).json({ success: false, message: "Code already exists." });
    }

    const insertQuery =
      'INSERT INTO links (code, longurl) VALUES ($1, $2) RETURNING code, longurl AS "longURL"';
    const { rows } = await pool.query(insertQuery, [code, longURL]);

    return res.status(201).json({
      success: true,
      message: "Link created",
      data: rows[0],
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/links", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT code, longurl AS \"longURL\", clicks, createdat AS \"createdAt\", lastclicked AS \"lastClicked\" FROM links ORDER BY createdat DESC"
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
});

router.get("/links/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const link = await getLinkByCode(code);
    if (!link) {
      return res.status(404).json({ success: false, message: "Link not found." });
    }
    return res.json({
      success: true,
      data: {
        code: link.code,
        longURL: link.longURL,
        clicks: link.clicks,
        createdAt: link.createdAt,
        lastClicked: link.lastClicked,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/links/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { rowCount } = await pool.query("DELETE FROM links WHERE code = $1", [code]);
    if (!rowCount) {
      return res.status(404).json({ success: false, message: "Link not found." });
    }
    return res.json({ success: true, message: "Link deleted." });
  } catch (error) {
    return next(error);
  }
});

export default router;
