import Link from "../models/Link.js";

/**
 * Render the dashboard page with all links
 */
export const renderDashboard = async (req, res, next) => {
  try {
    const links = await Link.findAll();
    res.render("dashboard", {
      links,
      message: req.query.message || null,
      error: req.query.error || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render the stats page for a specific link
 */
export const renderStats = async (req, res, next) => {
  try {
    const { code } = req.params;
    const link = await Link.findByCode(code);

    if (!link) {
      return res.status(404).render("stats", { link: null });
    }

    return res.render("stats", { link });
  } catch (error) {
    return next(error);
  }
};

/**
 * Redirect short link to destination URL
 */
export const redirectLink = async (req, res, next) => {
  try {
    const { code } = req.params;
    const link = await Link.incrementClick(code);

    if (!link) {
      return res.status(404).send("Short link not found.");
    }

    return res.redirect(link.longURL);
  } catch (error) {
    return next(error);
  }
};

/**
 * Health check endpoint
 */
export const healthCheck = (req, res) => {
  res.json({ ok: true, version: "1.0" });
};
