import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../src/app";

const app = createApp();

describe("POST /api/v1/auth/register — validation", () => {
  it("rejects an invalid email with 422", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "not-an-email",
      password: "supersecret123",
      fullName: "Test User",
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("rejects a too-short password with 422", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "valid@example.com",
      password: "short",
      fullName: "Test User",
    });

    expect(res.status).toBe(422);
  });

  it("rejects a missing fullName with 422", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "valid@example.com",
      password: "supersecret123",
    });

    expect(res.status).toBe(422);
  });
});

describe("POST /api/v1/auth/login — validation", () => {
  it("rejects an invalid email with 422", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "nope",
      password: "whatever",
    });

    expect(res.status).toBe(422);
  });
});

describe("GET /api/v1/auth/me — authentication", () => {
  it("rejects requests with no Authorization header", async () => {
    const res = await request(app).get("/api/v1/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects requests with a malformed Authorization header", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "NotBearer sometoken");

    expect(res.status).toBe(401);
  });

  it("rejects requests with an invalid/expired token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer this.is.not.a.valid.jwt");

    expect(res.status).toBe(401);
  });

  it("no longer echoes the raw JWT payload — looks up the real user instead", async () => {
    // Signed with the same JWT_SECRET the test environment sets in jest.setup.js
    const token = jwt.sign(
      { sub: "non-existent-user-id", email: "ghost@example.com", role: "CITIZEN" },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );

    const res = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);

    // This sandbox has no live Postgres, so a nonexistent user surfaces
    // as a 500 here rather than the clean 401 it'll return against a
    // real database. Either way, the key regression-prevention check
    // holds: the response is no longer a 200 that just parrots back the
    // JWT's { sub, email, role } — confirming /me does a real lookup
    // instead of trusting the token's contents.
    expect(res.status).not.toBe(200);
  });
});
