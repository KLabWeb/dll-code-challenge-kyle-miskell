import { Request, Response, NextFunction } from "express";
import { requestLogger } from "../../../src/middleware/requestLogger";
import logger from "../../../src/config/winstonLogger";

// Mock the logger
jest.mock("../../../src/config/winstonLogger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  http: jest.fn(),
  debug: jest.fn(),
}));

describe("requestLogger Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: "GET",
      path: "/api/users",
      query: {},
      ip: "127.0.0.1",
      get: jest.fn((header: string) => {
        if (header === "user-agent") {
          return "jest-test-agent";
        }
        return undefined;
      }) as any,
    };
    mockResponse = {
      statusCode: 200,
      on: jest.fn() as any,
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe("Response completion logging", () => {
    it("should log successful request with 200 status", () => {
      const finishCallback = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 200;
      finishCallback();

      expect(logger.http).toHaveBeenCalledWith(
        "Request completed",
        expect.objectContaining({
          method: "GET",
          path: "/api/users",
          statusCode: 200,
          ip: "127.0.0.1",
          duration: expect.stringMatching(/\d+ms/),
        })
      );
    });

    it("should log client error with 400 status", () => {
      const finishCallback = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 400;
      finishCallback();

      expect(logger.warn).toHaveBeenCalledWith(
        "Request completed with client error",
        expect.objectContaining({
          statusCode: 400,
        })
      );
    });

    it("should log client error with 404 status", () => {
      const finishCallback = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 404;
      finishCallback();

      expect(logger.warn).toHaveBeenCalledWith(
        "Request completed with client error",
        expect.objectContaining({
          statusCode: 404,
        })
      );
    });

    it("should log server error with 500 status", () => {
      const finishCallback = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 500;
      finishCallback();

      expect(logger.error).toHaveBeenCalledWith(
        "Request completed with server error",
        expect.objectContaining({
          statusCode: 500,
        })
      );
    });

    it("should log server error with 503 status", () => {
      const finishCallback = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 503;
      finishCallback();

      expect(logger.error).toHaveBeenCalledWith(
        "Request completed with server error",
        expect.objectContaining({
          statusCode: 503,
        })
      );
    });
  });

  describe("Request duration tracking", () => {
    it("should measure and log request duration", (done) => {
      const finishCallback = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 200;

      setTimeout(() => {
        finishCallback();

        expect(logger.http).toHaveBeenCalledWith(
          "Request completed",
          expect.objectContaining({
            duration: expect.stringMatching(/\d+ms/),
          })
        );
        done();
      }, 50);
    });

    it("should log duration in milliseconds format", () => {
      const finishCallback = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 200;
      finishCallback();

      const logCall = (logger.http as jest.Mock).mock.calls.find(
        (call) => call[0] === "Request completed"
      );
      expect(logCall).toBeDefined();
      expect(logCall[1].duration).toMatch(/^\d+ms$/);
    });
  });

  describe("Middleware behavior", () => {
    it("should call next() immediately", () => {
      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it("should register finish event listener", () => {
      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.on).toHaveBeenCalledWith("finish", expect.any(Function));
    });
  });

  describe("Different HTTP methods", () => {
    it("should handle PUT requests", () => {
      const finishCallback = jest.fn();
      mockRequest = {
        method: "PUT",
        path: "/api/users",
        query: {},
        ip: "127.0.0.1",
        get: jest.fn(() => {
          return "jest-test-agent";
        }) as any,
      };
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 200;
      finishCallback();

      expect(logger.http).toHaveBeenCalledWith(
        "Request completed",
        expect.objectContaining({
          method: "PUT",
        })
      );
    });

    it("should handle DELETE requests", () => {
      const finishCallback = jest.fn();
      mockRequest = {
        method: "DELETE",
        path: "/api/users",
        query: {},
        ip: "127.0.0.1",
        get: jest.fn(() => {
          return "jest-test-agent";
        }) as any,
      };
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 200;
      finishCallback();

      expect(logger.http).toHaveBeenCalledWith(
        "Request completed",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    it("should handle PATCH requests", () => {
      const finishCallback = jest.fn();
      mockRequest = {
        method: "PATCH",
        path: "/api/users",
        query: {},
        ip: "127.0.0.1",
        get: jest.fn(() => {
          return "jest-test-agent";
        }) as any,
      };
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 200;
      finishCallback();

      expect(logger.http).toHaveBeenCalledWith(
        "Request completed",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });
  });

  describe("Different status codes", () => {
    it("should log 2xx responses with http level", () => {
      const finishCallback = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 201;
      finishCallback();

      expect(logger.http).toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should log 4xx responses with warn level", () => {
      const finishCallback = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 422;
      finishCallback();

      expect(logger.warn).toHaveBeenCalled();
      expect(logger.http).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should log 5xx responses with error level", () => {
      const finishCallback = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 502;
      finishCallback();

      expect(logger.error).toHaveBeenCalled();
      expect(logger.http).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe("Log data structure", () => {
    it("should include all required fields", () => {
      const finishCallback = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 200;
      finishCallback();

      expect(logger.http).toHaveBeenCalledWith(
        "Request completed",
        expect.objectContaining({
          method: expect.any(String),
          path: expect.any(String),
          statusCode: expect.any(Number),
          duration: expect.any(String),
          ip: expect.any(String),
        })
      );
    });
  });

  describe("Performance monitoring", () => {
    it("should log slow requests (> 1 second)", () => {
      const finishCallback = jest.fn();
      const originalDateNow = Date.now;
      let startTime = 1000000;

      // Mock Date.now to simulate a slow request
      Date.now = jest.fn(() => {
        const time = startTime;
        startTime += 1500; // Add 1.5 seconds on second call
        return time;
      });

      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 200;
      finishCallback();

      expect(logger.warn).toHaveBeenCalledWith(
        "Request completed - SLOW",
        expect.objectContaining({
          durationMs: 1500,
          slow: true,
        })
      );

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it("should log very slow requests (> 3 seconds)", () => {
      const finishCallback = jest.fn();
      const originalDateNow = Date.now;
      let startTime = 1000000;

      // Mock Date.now to simulate a very slow request
      Date.now = jest.fn(() => {
        const time = startTime;
        startTime += 4000; // Add 4 seconds on second call
        return time;
      });

      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 200;
      finishCallback();

      expect(logger.warn).toHaveBeenCalledWith(
        "Request completed - VERY SLOW",
        expect.objectContaining({
          durationMs: 4000,
          verySlow: true,
        })
      );

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it("should not log as slow for fast requests", () => {
      const finishCallback = jest.fn();
      mockResponse.on = jest.fn((event, callback) => {
        if (event === "finish") {
          finishCallback.mockImplementation(callback);
        }
        return mockResponse as Response;
      }) as any;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      mockResponse.statusCode = 200;
      finishCallback();

      expect(logger.http).toHaveBeenCalledWith(
        "Request completed",
        expect.objectContaining({
          slow: false,
          verySlow: false,
        })
      );
    });
  });
});
