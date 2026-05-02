/**
 * HTML Sanitization Middleware
 * Prevents XSS by sanitizing string fields in request body.
 */
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const { window } = new JSDOM('');
const dompurify = createDOMPurify(window);

const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    return dompurify.sanitize(obj, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitizeObject(v)])
    );
  }
  return obj;
};

/**
 * Middleware that sanitizes all string values in req.body
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

module.exports = { sanitizeBody, sanitizeObject };
