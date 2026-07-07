import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();

describe("GET /api/v1/health", () => {
  it("returns 200 with the expected health payload shape", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "CivicVision Backend Running",
      version: expect.any(String),
      uptime: expect.any(String),
      environment: expect.any(String),
    });
  });

  it("includes a request id header for tracing", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.headers["x-request-id"]).toBeDefined();
  });
});

describe("GET /api/v1/health/ready", () => {
  it("responds with a well-formed readiness payload reflecting database status", async () => {
    const res = await request(app).get("/api/v1/health/ready");

    // In this environment the Prisma client cannot connect (no live
    // Postgres instance, and `prisma generate` requires network access
    // this sandbox doesn't have) — so we assert the *shape* of the
    // response and that the endpoint degrades gracefully to 503
    // rather than crashing, instead of asserting a specific status.
    expect([200, 503]).toContain(res.status);
    expect(res.body).toMatchObject({
      success: res.status === 200,
      checks: {
        database: {
          status: res.status === 200 ? "up" : "down",
        },
      },
    });
  });
});

describe("Unknown route", () => {
  it("returns a 404 with a consistent error envelope", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      message: expect.stringContaining("Route not found"),
    });
  });
});
