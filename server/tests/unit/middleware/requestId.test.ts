import { Request, Response, NextFunction } from "express";
import { requestIdMiddleware } from "../../../src/middleware/requestId";

describe("requestIdMiddleware", () => {
  let mockReq: Partial<Request> & { headers?: any };
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let setHeaderSpy: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    setHeaderSpy = jest.fn();
    mockRes = {
      setHeader: setHeaderSpy,
    };
    mockNext = jest.fn();
  });

  describe("Request ID generation", () => {
    it("should generate a new request ID if none provided", () => {
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).id).toBeDefined();
      expect(typeof (mockReq as any).id).toBe("string");
      expect((mockReq as any).id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it("should use existing request ID from headers", () => {
      const existingId = "existing-request-id-123";
      mockReq.headers = { "x-request-id": existingId };

      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).id).toBe(existingId);
    });

    it("should generate different IDs for different requests", () => {
      const mockReq1: Partial<Request> & { headers?: any } = { headers: {} };
      const mockReq2: Partial<Request> & { headers?: any } = { headers: {} };

      requestIdMiddleware(mockReq1 as Request, mockRes as Response, mockNext);
      requestIdMiddleware(mockReq2 as Request, mockRes as Response, mockNext);

      expect((mockReq1 as any).id).toBeDefined();
      expect((mockReq2 as any).id).toBeDefined();
      expect((mockReq1 as any).id).not.toBe((mockReq2 as any).id);
    });
  });

  describe("Response header", () => {
    it("should set X-Request-ID header on response", () => {
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(setHeaderSpy).toHaveBeenCalledWith("X-Request-ID", (mockReq as any).id);
    });

    it("should set X-Request-ID header with existing ID", () => {
      const existingId = "existing-id-456";
      mockReq.headers = { "x-request-id": existingId };

      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(setHeaderSpy).toHaveBeenCalledWith("X-Request-ID", existingId);
    });
  });

  describe("Middleware flow", () => {
    it("should call next() to continue middleware chain", () => {
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe("Audit trail support", () => {
    it("should attach ID to request for downstream middleware access", () => {
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).id).toBeDefined();
      // Verify it's accessible as property
      const requestId = (mockReq as any).id;
      expect(typeof requestId).toBe("string");
      expect(requestId.length).toBeGreaterThan(0);
    });
  });
});
