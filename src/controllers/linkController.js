import Link from "../models/Link.js";
import { validateUrl, generateUniqueCode } from "../utils/helpers.js";
import { CODE_REGEX } from "../utils/validators.js";

/**
 * Create a new short link
 */
export const createLink = async (req, res, next) => {
  try {
    let { longURL, code } = req.body;

    // Validate URL
    if (!longURL || !validateUrl(longURL.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid URL.",
      });
    }

    longURL = longURL.trim();

    // Validate custom code if provided
    if (code && !CODE_REGEX.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Code must be 6-8 alphanumeric characters.",
      });
    }

    // Generate code if not provided
    if (!code) {
      code = await generateUniqueCode();
    }

    // Check if code already exists
    const existing = await Link.findByCode(code);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Code already exists.",
      });
    }

    // Create the link
    const newLink = await Link.create(code, longURL);

    return res.status(201).json({
      success: true,
      message: "Link created",
      data: newLink,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all links
 */
export const getAllLinks = async (req, res, next) => {
  try {
    const links = await Link.findAll();
    return res.json({ success: true, data: links });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get a single link by code
 */
export const getLinkByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const link = await Link.findByCode(code);

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found.",
      });
    }

    return res.json({
      success: true,
      data: link,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete a link by code
 */
export const deleteLink = async (req, res, next) => {
  try {
    const { code } = req.params;
    const deleted = await Link.deleteByCode(code);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Link not found.",
      });
    }

    return res.json({
      success: true,
      message: "Link deleted.",
    });
  } catch (error) {
    return next(error);
  }
};
