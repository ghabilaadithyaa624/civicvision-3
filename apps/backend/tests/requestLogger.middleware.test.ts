import request from "supertest";
import express from "express";

// Keep a reference to the mocked logger we'll create later
const mockLoggerInfo = jest.fn();

// We must test both paths (isTest true/false). Since the middleware caches
// the `skip` function closure which uses `isTest` from the environment, we
// dynamically require the middleware within separate test blocks where we mock
// the environment differently using jest.doMock and jest.resetModules.

describe("requestLogger middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules(); // clears the require cache

    // We mock logger here so it's fresh for each module reset
    jest.doMock("../src/config/logger", () => ({
      logger: {
        info: mockLoggerInfo,
      },
    }));
  });

  describe("when isTest is true (logging disabled)", () => {
    it("should skip logging", async () => {
      jest.doMock("../src/config/env", () => ({
        isTest: true,
      }));

      const { requestLogger } = await import("../src/middleware/requestLogger.middleware");

      const app = express();
      app.use(requestLogger);
      app.get("/", (_req, res) => {
        res.send("ok");
      });

      await request(app).get("/");
      expect(mockLoggerInfo).not.toHaveBeenCalled();
    });
  });

  describe("when isTest is false (logging enabled)", () => {
    it("should log the request", async () => {
      jest.doMock("../src/config/env", () => ({
        isTest: false,
      }));

      const { requestLogger } = await import("../src/middleware/requestLogger.middleware");

      const app = express();
      app.use(requestLogger);
      app.get("/", (_req, res) => {
        res.send("ok");
      });

      await request(app).get("/");

      expect(mockLoggerInfo).toHaveBeenCalled();

      const logCallArg = mockLoggerInfo.mock.calls[0][0];
      expect(typeof logCallArg).toBe("string");
      expect(logCallArg).toMatch(/GET \/ 200/);
    });

    it("should include request id if present", async () => {
      jest.doMock("../src/config/env", () => ({
        isTest: false,
      }));

      const { requestLogger } = await import("../src/middleware/requestLogger.middleware");

      const app = express();
      app.use((req: express.Request & { id?: string }, _res, next) => {
        req.id = "test-req-id";
        next();
      });
      app.use(requestLogger);
      app.get("/", (_req, res) => {
        res.send("ok");
      });

      await request(app).get("/");

      expect(mockLoggerInfo).toHaveBeenCalled();
      const logCallArg = mockLoggerInfo.mock.calls[0][0];
      expect(logCallArg).toMatch(/^test-req-id /);
    });
  });
});
