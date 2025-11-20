/**
 * Regular expression for validating link codes
 */
export const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

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
