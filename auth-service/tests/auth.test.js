const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");
const createApp = require("../src/app");

describe("auth-service", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "taskflow-auth-"));
  const dbPath = path.join(tempDir, "auth-test.db");
  const app = createApp({
    dbPath,
    jwtSecret: "test-secret",
    corsOrigin: "*"
  });

  afterAll(() => {
    app.locals.db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("GET /health returns service status", async () => {
    const response = await request(app).get("/health");
    expect(response.statusCode).toBe(200);
    expect(response.body.service).toBe("auth-service");
  });

  test("POST /api/auth/register creates a user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Aisha Khan",
      email: "aisha@example.com",
      password: "supersecret123"
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe("aisha@example.com");
  });

  test("POST /api/auth/register rejects duplicate emails", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Aisha Khan",
      email: "aisha@example.com",
      password: "supersecret123"
    });

    expect(response.statusCode).toBe(409);
  });

  test("POST /api/auth/login authenticates an existing user", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "aisha@example.com",
      password: "supersecret123"
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.user.name).toBe("Aisha Khan");
  });

  test("GET /api/auth/me requires a valid token", async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "aisha@example.com",
      password: "supersecret123"
    });

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.user.email).toBe("aisha@example.com");
  });

  test("POST /api/auth/login rejects bad credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "aisha@example.com",
      password: "wrongpassword"
    });

    expect(response.statusCode).toBe(401);
  });
});
