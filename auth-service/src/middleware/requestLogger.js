const logger = require("../utils/logger");

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    logger.info({
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip
    });
  });

  next();
}

module.exports = requestLogger;

