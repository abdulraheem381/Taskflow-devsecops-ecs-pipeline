const fs = require("fs");
const jwt = require("jsonwebtoken");
const os = require("os");
const path = require("path");
const request = require("supertest");
const createApp = require("../src/app");

describe("tasks-service", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "taskflow-tasks-"));
  const dbPath = path.join(tempDir, "tasks-test.db");
  const app = createApp({
    dbPath,
    jwtSecret: "test-secret",
    corsOrigin: "*"
  });
  const token = jwt.sign(
    { sub: 101, email: "aisha@example.com", name: "Aisha Khan" },
    "test-secret",
    { expiresIn: "1h" }
  );

  afterAll(() => {
    app.locals.db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("GET /health returns service status", async () => {
    const response = await request(app).get("/health");
    expect(response.statusCode).toBe(200);
    expect(response.body.service).toBe("tasks-service");
  });

  test("GET /api/tasks requires authentication", async () => {
    const response = await request(app).get("/api/tasks");
    expect(response.statusCode).toBe(401);
  });

  test("POST /api/tasks creates a task", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Prepare ECS deployment manifest",
        description: "Finalize task definition and health checks.",
        status: "Todo",
        priority: "High",
        assignee: "Aisha Khan",
        dueDate: "2026-04-10T00:00:00.000Z"
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.task.title).toBe("Prepare ECS deployment manifest");
  });

  test("GET /api/tasks returns only the authenticated user's tasks", async () => {
    const response = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.tasks).toHaveLength(1);
  });

  test("PUT /api/tasks/:id updates a task", async () => {
    const response = await request(app)
      .put("/api/tasks/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Prepare ECS deployment manifest",
        description: "Task definition updated for Fargate.",
        status: "InProgress",
        priority: "High",
        assignee: "Aisha Khan",
        dueDate: "2026-04-11T00:00:00.000Z"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.task.status).toBe("InProgress");
  });

  test("DELETE /api/tasks/:id removes a task", async () => {
    const response = await request(app)
      .delete("/api/tasks/1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(204);
  });
});
