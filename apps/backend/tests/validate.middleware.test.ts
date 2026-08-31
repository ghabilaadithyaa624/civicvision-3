import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../src/middleware/validate.middleware";

describe("validate middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it("calls next() without arguments and updates req.body for valid input", () => {
    const schema = z.object({
      body: z.object({
        name: z.string().trim(),
        age: z.coerce.number().default(18),
      }),
    });

    mockRequest.body = { name: "  Alice  " };

    const middleware = validate(schema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
    // req.body should reflect the coerced and trimmed values
    expect(mockRequest.body).toEqual({ name: "Alice", age: 18 });
  });

  it("calls next() with a ZodError for invalid input", () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email(),
      }),
    });

    mockRequest.body = { email: "not-a-valid-email" };

    const middleware = validate(schema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
    // Should be called with the ZodError
    expect(nextFunction.mock.calls[0][0]).toBeInstanceOf(z.ZodError);
    // req.body should remain unmodified on failure
    expect(mockRequest.body).toEqual({ email: "not-a-valid-email" });
  });

  it("does not modify req.body if the schema does not output a body", () => {
    const schema = z.object({
      query: z.object({
        search: z.string(),
      }),
    });

    mockRequest.body = { originalData: true };
    mockRequest.query = { search: "test" };

    const middleware = validate(schema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction as NextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(nextFunction).toHaveBeenCalledWith();
    // req.body should be untouched because result.data.body is undefined
    expect(mockRequest.body).toEqual({ originalData: true });
  });
});
