import { requireRole } from "@middleware/requireRole.middleware";
import { ForbiddenError } from "@utils/AppError";
import type { Request, Response, NextFunction } from "express";
import type { AccessTokenPayload } from "@app-types/jwt.types";

describe("requireRole middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it("should call next() without arguments when user has the required role", () => {
    mockRequest = {
      user: { role: "ADMIN" } as AccessTokenPayload
    };

    const middleware = requireRole("ADMIN");
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  it("should call next() without arguments when user has one of multiple allowed roles", () => {
    mockRequest = {
      user: { role: "FIELD_AGENT" } as AccessTokenPayload
    };

    const middleware = requireRole("ADMIN", "FIELD_AGENT");
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  it("should call next() with ForbiddenError when user role is not in allowed roles", () => {
    mockRequest = {
      user: { role: "CITIZEN" } as AccessTokenPayload
    };

    const middleware = requireRole("ADMIN", "FIELD_AGENT");
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
      message: "You do not have permission to access this resource"
    }));
  });

  it("should call next() with ForbiddenError when req.user is undefined", () => {
    mockRequest = {};

    const middleware = requireRole("ADMIN");
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it("should call next() with ForbiddenError when req.user.role is undefined", () => {
    mockRequest = {
      user: {} as AccessTokenPayload
    };

    const middleware = requireRole("ADMIN");
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });
});
