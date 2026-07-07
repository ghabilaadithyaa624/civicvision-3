import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../src/app";

const app = createApp();

function tokenFor(role: "CITIZEN" | "FIELD_AGENT" | "ADMIN", sub = "test-user"): string {
  return jwt.sign(
    { sub, email: "test@example.com", role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" },
  );
}

describe("POST /api/v1/issues — validation", () => {
  it("rejects requests with no Authorization header", async () => {
    const res = await request(app).post("/api/v1/issues").send({
      title: "Pothole",
      category: "POTHOLE",
      latitude: 1,
      longitude: 1,
    });
    expect(res.status).toBe(401);
  });

  it("rejects a title shorter than 3 characters", async () => {
    const res = await request(app)
      .post("/api/v1/issues")
      .set("Authorization", `Bearer ${tokenFor("CITIZEN")}`)
      .send({ title: "Hi", category: "POTHOLE", latitude: 1, longitude: 1 });
    expect(res.status).toBe(422);
  });

  it("rejects an invalid category", async () => {
    const res = await request(app)
      .post("/api/v1/issues")
      .set("Authorization", `Bearer ${tokenFor("CITIZEN")}`)
      .send({ title: "Valid title", category: "NOT_A_CATEGORY", latitude: 1, longitude: 1 });
    expect(res.status).toBe(422);
  });

  it("rejects out-of-range latitude", async () => {
    const res = await request(app)
      .post("/api/v1/issues")
      .set("Authorization", `Bearer ${tokenFor("CITIZEN")}`)
      .send({ title: "Valid title", category: "POTHOLE", latitude: 999, longitude: 1 });
    expect(res.status).toBe(422);
  });
});

describe("GET /api/v1/issues", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/v1/issues");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/v1/issues/:id — role-based access control", () => {
  it("rejects a CITIZEN attempting to update issue status", async () => {
    const res = await request(app)
      .patch("/api/v1/issues/some-id")
      .set("Authorization", `Bearer ${tokenFor("CITIZEN")}`)
      .send({ status: "RESOLVED" });

    expect(res.status).toBe(403);
  });

  it("rejects an invalid status value even for a FIELD_AGENT", async () => {
    const res = await request(app)
      .patch("/api/v1/issues/some-id")
      .set("Authorization", `Bearer ${tokenFor("FIELD_AGENT")}`)
      .send({ status: "NOT_A_STATUS" });

    expect(res.status).toBe(422);
  });
});

describe("DELETE /api/v1/issues/:id — role-based access control", () => {
  it("rejects a CITIZEN attempting to delete an issue", async () => {
    const res = await request(app)
      .delete("/api/v1/issues/some-id")
      .set("Authorization", `Bearer ${tokenFor("CITIZEN")}`);

    expect(res.status).toBe(403);
  });

  it("rejects a FIELD_AGENT attempting to delete an issue (ADMIN-only)", async () => {
    const res = await request(app)
      .delete("/api/v1/issues/some-id")
      .set("Authorization", `Bearer ${tokenFor("FIELD_AGENT")}`);

    expect(res.status).toBe(403);
  });
});
