const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl
  });

  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.statusCode || 500).json({
    message: err.publicMessage || "Internal server error"
  });
}

module.exports = errorHandler;

