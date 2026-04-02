const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const createTasksController = require("./controllers/tasksController");
const createAuthenticate = require("./middleware/authenticate");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");
const createTaskRoutes = require("./routes/taskRoutes");
const { createDatabase } = require("./utils/db");

dotenv.config();

function createApp(options = {}) {
  const config = {
    port: Number(options.port || process.env.PORT || 4002),
    dbPath: options.dbPath || process.env.DB_PATH || "./data/tasks.db",
    jwtSecret: options.jwtSecret || process.env.JWT_SECRET || "development-secret",
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
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  }));

  const controller = createTasksController({ db });
  const authenticate = createAuthenticate(config.jwtSecret);

  app.get("/health", (req, res) => {
    const taskCount = db.prepare("SELECT COUNT(*) AS total FROM tasks").get().total;
    res.json({ status: "ok", service: "tasks-service", taskCount });
  });

  app.use("/api/tasks", authenticate, createTaskRoutes(controller));
  app.use((req, res) => res.status(404).json({ message: "Route not found" }));
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

