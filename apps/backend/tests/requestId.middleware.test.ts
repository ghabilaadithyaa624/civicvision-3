import { Request, Response, NextFunction } from 'express';
import { requestId } from '../src/middleware/requestId.middleware';

describe('requestId middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn().mockReturnValue(undefined),
    };
    mockResponse = {
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should generate a UUID and set it when x-request-id header is absent', () => {
    requestId(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.header).toHaveBeenCalledWith('x-request-id');
    expect(mockRequest.id).toBeDefined();
    // Check if it's a valid UUID (basic format check)
    expect(mockRequest.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(mockResponse.setHeader).toHaveBeenCalledWith('x-request-id', mockRequest.id);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should use the existing x-request-id header if it is present', () => {
    const existingId = 'test-existing-id-123';
    mockRequest.header = jest.fn().mockReturnValue(existingId);

    requestId(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.header).toHaveBeenCalledWith('x-request-id');
    expect(mockRequest.id).toEqual(existingId);
    expect(mockResponse.setHeader).toHaveBeenCalledWith('x-request-id', existingId);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should generate a UUID if x-request-id header is an empty string', () => {
    mockRequest.header = jest.fn().mockReturnValue('');

    requestId(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.header).toHaveBeenCalledWith('x-request-id');
    expect(mockRequest.id).toBeDefined();
    expect(mockRequest.id).not.toEqual('');
    expect(mockRequest.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(mockResponse.setHeader).toHaveBeenCalledWith('x-request-id', mockRequest.id);
    expect(nextFunction).toHaveBeenCalled();
  });
});
