const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const createAuthController = require("./controllers/authController");
const createAuthenticate = require("./middleware/authenticate");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");
const createAuthRoutes = require("./routes/authRoutes");
const { createDatabase } = require("./utils/db");

dotenv.config();

function createApp(options = {}) {
  const config = {
    port: Number(options.port || process.env.PORT || 4001),
    dbPath: options.dbPath || process.env.DB_PATH || "./data/auth.db",
    jwtSecret: options.jwtSecret || process.env.JWT_SECRET || "development-secret",
    jwtExpiresIn: options.jwtExpiresIn || process.env.JWT_EXPIRES_IN || "8h",
    corsOrigin: options.corsOrigin || process.env.CORS_ORIGIN || "http://localhost:3000"
  };

  const db = createDatabase(config.dbPath);
  const app = express();

  app.locals.db = db;
  app.locals.config = config;

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin === "*" ? true : config.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(requestLogger);
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false
  }));

  const controller = createAuthController({
    db,
    jwtSecret: config.jwtSecret,
    jwtExpiresIn: config.jwtExpiresIn
  });
  const authenticate = createAuthenticate(config.jwtSecret);

  app.get("/health", (req, res) => {
    const userCount = db.prepare("SELECT COUNT(*) AS total FROM users").get().total;
    res.json({ status: "ok", service: "auth-service", userCount });
  });

  app.use("/api/auth", createAuthRoutes(controller, authenticate));
  app.use((req, res) => res.status(404).json({ message: "Route not found" }));
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

