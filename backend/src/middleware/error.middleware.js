const { sendDatabaseAwareError } = require("../utils/db-error-response");

/**
 * Global Error Handling Middleware
 * Catch-all for any errors thrown in the request lifecycle.
 */
const errorMiddleware = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}`);
  console.error(err);

  // If response headers already sent, delegate to default express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Use the existing database-aware error utility
  return sendDatabaseAwareError(res, err, "Internal Server Error");
};

module.exports = errorMiddleware;
