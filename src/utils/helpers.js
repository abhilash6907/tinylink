import Link from "../models/Link.js";

/**
 * Alphanumeric characters for code generation
 */
const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generate a random alphanumeric code
 */
export const generateRandomCode = (length = 6) => {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
  }
  return code;
};

/**
 * Generate a unique code by checking database
 */
export const generateUniqueCode = async () => {
  for (let i = 0; i < 5; i += 1) {
    const candidate = generateRandomCode(6 + (i % 3));
    const exists = await Link.exists(candidate);
    if (!exists) {
      return candidate;
    }
  }
  throw new Error("Unable to generate unique code. Please provide one manually.");
};

/**
 * Validate a URL string
 */
export const validateUrl = (value = "") => {
  try {
    const parsed = new URL(value);
    return Boolean(parsed.protocol && parsed.hostname);
  } catch {
    return false;
  }
};
