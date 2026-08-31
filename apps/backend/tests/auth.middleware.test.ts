import { Request, Response, NextFunction } from "express";
import { authenticate } from "../src/middleware/auth.middleware";
import { UnauthorizedError } from "../src/utils/AppError";
import { TokenService } from "../src/services/token.service";
import { AccessTokenPayload } from "../src/types/jwt.types";

jest.mock("../src/config/env", () => ({
  env: {
    JWT_SECRET: "test-secret",
    JWT_REFRESH_SECRET: "test-refresh-secret",
  }
}));

describe("auth.middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should call next with UnauthorizedError if authorization header is missing", () => {
    (mockRequest.header as jest.Mock).mockReturnValue(undefined);

    authenticate(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect((mockNext.mock.calls[0][0] as UnauthorizedError).message).toBe("Missing or invalid Authorization header");
  });

  it("should call next with UnauthorizedError if authorization header does not start with Bearer", () => {
    (mockRequest.header as jest.Mock).mockReturnValue("Basic token");

    authenticate(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect((mockNext.mock.calls[0][0] as UnauthorizedError).message).toBe("Missing or invalid Authorization header");
  });

  it("should call next with err if token is invalid or expired", () => {
    (mockRequest.header as jest.Mock).mockReturnValue("Bearer invalid-token");

    // TokenService verifyAccessToken will throw UnauthorizedError by default if token is not valid

    authenticate(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should attach payload to req.user and call next if token is valid", () => {
    (mockRequest.header as jest.Mock).mockReturnValue("Bearer valid-token");

    const payload: AccessTokenPayload = { sub: "1", email: "test@example.com", role: "USER" };
    jest.spyOn(TokenService.prototype, "verifyAccessToken").mockReturnValue(payload);

    authenticate(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(mockRequest.user).toEqual(payload);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(); // called without args
  });
});
