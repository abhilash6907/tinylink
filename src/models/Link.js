import pool from "../config/database.js";

class Link {
  /**
   * Get a link by its code
   */
  static async findByCode(code) {
    const { rows } = await pool.query(
      'SELECT code, longurl AS "longURL", clicks, createdat AS "createdAt", lastclicked AS "lastClicked" FROM links WHERE code = $1',
      [code]
    );
    return rows[0] || null;
  }

  /**
   * Get all links ordered by creation date
   */
  static async findAll() {
    const { rows } = await pool.query(
      'SELECT code, longurl AS "longURL", clicks, createdat AS "createdAt", lastclicked AS "lastClicked" FROM links ORDER BY createdat DESC'
    );
    return rows;
  }

  /**
   * Create a new link
   */
  static async create(code, longURL) {
    const { rows } = await pool.query(
      'INSERT INTO links (code, longurl) VALUES ($1, $2) RETURNING code, longurl AS "longURL", clicks, createdat AS "createdAt"',
      [code, longURL]
    );
    return rows[0];
  }

  /**
   * Delete a link by code
   */
  static async deleteByCode(code) {
    const { rowCount } = await pool.query(
      "DELETE FROM links WHERE code = $1",
      [code]
    );
    return rowCount > 0;
  }

  /**
   * Increment click count and update last clicked timestamp
   */
  static async incrementClick(code) {
    const { rows } = await pool.query(
      "UPDATE links SET clicks = clicks + 1, lastclicked = NOW() WHERE code = $1 RETURNING longurl AS \"longURL\"",
      [code]
    );
    return rows[0] || null;
  }

  /**
   * Check if a code exists
   */
  static async exists(code) {
    const link = await this.findByCode(code);
    return link !== null;
  }
}

export default Link;
