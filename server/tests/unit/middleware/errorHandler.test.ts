import { Request, Response, NextFunction } from "express";
import {
  errorHandler,
  AppError,
  ValidationError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  TooManyRequestsError,
} from "../../../src/middleware/errorHandler";
import logger from "../../../src/config/winstonLogger";

// Mock the logger
jest.mock("../../../src/config/winstonLogger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("errorHandler Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: "GET",
      path: "/api/users",
      query: {},
      ip: "127.0.0.1",
      body: {},
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe("AppError handling", () => {
    it("should handle 400 AppError correctly", () => {
      const appError = new AppError(400, "Bad request error");

      errorHandler(appError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(logger.warn).toHaveBeenCalledWith(
        "Operational error occurred",
        expect.objectContaining({
          statusCode: 400,
          message: "Bad request error",
          errorType: "AppError",
          path: "/api/users",
          method: "GET",
          ip: "127.0.0.1",
          query: {},
        })
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Bad request error",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it("should handle 404 AppError correctly", () => {
      const notFoundError = new AppError(404, "Resource not found");

      errorHandler(notFoundError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Resource not found",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );

      expect(logger.warn).toHaveBeenCalledWith(
        "Operational error occurred",
        expect.objectContaining({
          statusCode: 404,
          message: "Resource not found",
          errorType: "AppError",
        })
      );
    });

    it("should handle 403 AppError correctly", () => {
      const forbiddenError = new AppError(403, "Access denied");

      errorHandler(forbiddenError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Access denied",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it("should log correct context for AppError", () => {
      mockRequest = {
        method: "GET",
        path: "/api/users",
        query: { page: "1", size: "10" },
        ip: "192.168.1.100",
        body: {},
        headers: {},
      };

      const appError = new AppError(400, "Invalid parameters");

      errorHandler(appError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(logger.warn).toHaveBeenCalledWith(
        "Operational error occurred",
        expect.objectContaining({
          statusCode: 400,
          message: "Invalid parameters",
          errorType: "AppError",
          path: "/api/users",
          method: "GET",
          ip: "192.168.1.100",
          query: { page: "1", size: "10" },
        })
      );
    });
  });

  describe("ValidationError handling", () => {
    it("should handle ValidationError with 422 status", () => {
      const validationError = new ValidationError("Invalid page parameter");

      errorHandler(validationError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Invalid page parameter",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );

      expect(logger.warn).toHaveBeenCalledWith(
        "Operational error occurred",
        expect.objectContaining({
          statusCode: 422,
          message: "Invalid page parameter",
          errorType: "ValidationError",
        })
      );
    });

    it("should handle ValidationError for invalid sort field", () => {
      const validationError = new ValidationError("Invalid sort field. Valid fields: name, id");

      errorHandler(validationError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Invalid sort field. Valid fields: name, id",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it("should handle ValidationError for invalid size", () => {
      const validationError = new ValidationError(
        "Invalid size parameter. Must be between 1 and 100"
      );

      errorHandler(validationError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Invalid size parameter. Must be between 1 and 100",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe("BadRequestError handling", () => {
    it("should handle BadRequestError with 400 status", () => {
      const badRequestError = new BadRequestError("Malformed request");

      errorHandler(badRequestError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Malformed request",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );

      expect(logger.warn).toHaveBeenCalledWith(
        "Operational error occurred",
        expect.objectContaining({
          statusCode: 400,
          errorType: "BadRequestError",
        })
      );
    });
  });

  describe("NotFoundError handling", () => {
    it("should handle NotFoundError with 404 status", () => {
      const notFoundError = new NotFoundError("User not found");

      errorHandler(notFoundError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "User not found",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it("should handle NotFoundError with default message", () => {
      const notFoundError = new NotFoundError();

      errorHandler(notFoundError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Resource not found",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe("UnauthorizedError handling", () => {
    it("should handle UnauthorizedError with 401 status", () => {
      const unauthorizedError = new UnauthorizedError("Invalid credentials");

      errorHandler(
        unauthorizedError,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Invalid credentials",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it("should handle UnauthorizedError with default message", () => {
      const unauthorizedError = new UnauthorizedError();

      errorHandler(
        unauthorizedError,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Unauthorized",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe("ForbiddenError handling", () => {
    it("should handle ForbiddenError with 403 status", () => {
      const forbiddenError = new ForbiddenError("Access denied");

      errorHandler(forbiddenError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Access denied",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it("should handle ForbiddenError with default message", () => {
      const forbiddenError = new ForbiddenError();

      errorHandler(forbiddenError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Forbidden",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe("ConflictError handling", () => {
    it("should handle ConflictError with 409 status", () => {
      const conflictError = new ConflictError("Resource already exists");

      errorHandler(conflictError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Resource already exists",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );

      expect(logger.warn).toHaveBeenCalledWith(
        "Operational error occurred",
        expect.objectContaining({
          statusCode: 409,
          errorType: "ConflictError",
        })
      );
    });
  });

  describe("TooManyRequestsError handling", () => {
    it("should handle TooManyRequestsError with 429 status", () => {
      const rateLimitError = new TooManyRequestsError("Rate limit exceeded");

      errorHandler(rateLimitError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Rate limit exceeded",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );

      expect(logger.warn).toHaveBeenCalledWith(
        "Operational error occurred",
        expect.objectContaining({
          statusCode: 429,
          errorType: "TooManyRequestsError",
        })
      );
    });

    it("should handle TooManyRequestsError with default message", () => {
      const rateLimitError = new TooManyRequestsError();

      errorHandler(rateLimitError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Too many requests",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe("Unexpected error handling", () => {
    it("should handle unexpected errors and return 500", () => {
      const unexpectedError = new Error("Unexpected error occurred");
      unexpectedError.stack = "Error stack trace...";

      errorHandler(unexpectedError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(logger.error).toHaveBeenCalledWith(
        "Unexpected error occurred",
        expect.objectContaining({
          message: "Unexpected error occurred",
          stack: "Error stack trace...",
          path: "/api/users",
          method: "GET",
          ip: "127.0.0.1",
          query: {},
          body: {},
          headers: {},
        })
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Internal server error",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it("should log full error details including body and headers", () => {
      const error = new Error("Database connection failed");
      mockRequest.body = { userId: 123, action: "update" };
      mockRequest.headers = {
        authorization: "Bearer token",
        "content-type": "application/json",
      };

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(logger.error).toHaveBeenCalledWith(
        "Unexpected error occurred",
        expect.objectContaining({
          message: "Database connection failed",
          path: "/api/users",
          body: { userId: 123, action: "update" },
          headers: {
            authorization: "Bearer token",
            "content-type": "application/json",
          },
        })
      );
    });

    it("should include stack trace for unexpected errors", () => {
      const error = new Error("Critical failure");
      error.stack = "Error: Critical failure\n    at Function.test\n    at process";

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(logger.error).toHaveBeenCalledWith(
        "Unexpected error occurred",
        expect.objectContaining({
          stack: expect.stringContaining("Error: Critical failure"),
        })
      );
    });

    it("should handle errors without stack traces", () => {
      const error = new Error("Error without stack");
      delete error.stack;

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(logger.error).toHaveBeenCalledWith(
        "Unexpected error occurred",
        expect.objectContaining({
          message: "Error without stack",
          stack: undefined,
        })
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("Error Class constructors", () => {
    it("should create AppError with correct properties", () => {
      const error = new AppError(400, "Test error");

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Test error");
      expect(error.isOperational).toBe(true);
      expect(error instanceof Error).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });

    it("should create ValidationError with 422 status", () => {
      const error = new ValidationError("Invalid input");

      expect(error.statusCode).toBe(422);
      expect(error.message).toBe("Invalid input");
      expect(error.isOperational).toBe(true);
      expect(error instanceof ValidationError).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });

    it("should create BadRequestError with 400 status", () => {
      const error = new BadRequestError("Bad request");

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Bad request");
      expect(error.isOperational).toBe(true);
      expect(error instanceof BadRequestError).toBe(true);
    });

    it("should create NotFoundError with 404 status", () => {
      const error = new NotFoundError("User not found");

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("User not found");
      expect(error.isOperational).toBe(true);
      expect(error instanceof NotFoundError).toBe(true);
    });

    it("should create UnauthorizedError with 401 status", () => {
      const error = new UnauthorizedError();

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Unauthorized");
      expect(error.isOperational).toBe(true);
      expect(error instanceof UnauthorizedError).toBe(true);
    });

    it("should create ForbiddenError with 403 status", () => {
      const error = new ForbiddenError();

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe("Forbidden");
      expect(error.isOperational).toBe(true);
      expect(error instanceof ForbiddenError).toBe(true);
    });

    it("should create ConflictError with 409 status", () => {
      const error = new ConflictError("Resource already exists");

      expect(error.statusCode).toBe(409);
      expect(error.message).toBe("Resource already exists");
      expect(error.isOperational).toBe(true);
      expect(error instanceof ConflictError).toBe(true);
    });

    it("should create TooManyRequestsError with 429 status", () => {
      const error = new TooManyRequestsError();

      expect(error.statusCode).toBe(429);
      expect(error.message).toBe("Too many requests");
      expect(error.isOperational).toBe(true);
      expect(error instanceof TooManyRequestsError).toBe(true);
    });

    it("should allow custom isOperational flag", () => {
      const error = new AppError(500, "Non-operational error", "CUSTOM_ERROR", false);

      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Non-operational error");
      expect(error.code).toBe("CUSTOM_ERROR");
      expect(error.isOperational).toBe(false);
    });

    it("should have correct prototype chain for ValidationError", () => {
      const error = new ValidationError("Test");

      expect(Object.getPrototypeOf(error)).toBe(ValidationError.prototype);
      expect(error instanceof ValidationError).toBe(true);
      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it("should have correct prototype chain for all error types", () => {
      const errors = [
        new BadRequestError("test"),
        new NotFoundError("test"),
        new UnauthorizedError("test"),
        new ForbiddenError("test"),
        new ConflictError("test"),
        new TooManyRequestsError("test"),
      ];

      errors.forEach((error) => {
        expect(error instanceof AppError).toBe(true);
        expect(error instanceof Error).toBe(true);
      });
    });
  });

  describe("Error logging behavior", () => {
    it("should log operational errors with warn level", () => {
      const validationError = new ValidationError("Invalid input");

      errorHandler(validationError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(logger.warn).toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should log unexpected errors with error level", () => {
      const unexpectedError = new Error("Unexpected");

      errorHandler(unexpectedError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(logger.error).toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it("should include error type in operational error logs", () => {
      const conflictError = new ConflictError("Duplicate entry");

      errorHandler(conflictError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(logger.warn).toHaveBeenCalledWith(
        "Operational error occurred",
        expect.objectContaining({
          errorType: "ConflictError",
        })
      );
    });
  });

  describe("Response format consistency", () => {
    it("should always return status and message fields", () => {
      const errors = [
        new ValidationError("Test"),
        new BadRequestError("Test"),
        new NotFoundError("Test"),
        new UnauthorizedError("Test"),
        new ForbiddenError("Test"),
        new ConflictError("Test"),
        new TooManyRequestsError("Test"),
      ];

      errors.forEach((error) => {
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        };

        errorHandler(error, mockRequest as Request, mockRes as unknown as Response, nextFunction);

        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "error",
            message: expect.any(String),
          })
        );
      });
    });

    it("should return generic message for unexpected errors", () => {
      const error = new Error("Internal database error");

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Internal server error",
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });
  });
});
