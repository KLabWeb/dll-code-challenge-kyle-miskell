import { Request, Response, NextFunction } from "express";
import { paginationValidator, validateSort } from "../../../src/middleware/paginationValidator";
import { ValidationError } from "../../../src/middleware/errorHandler";

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

import logger from "../../../src/config/winstonLogger";

describe("Pagination and Sort Validation Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
      method: "GET",
      path: "/api/users",
      ip: "127.0.0.1",
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe("paginationValidator", () => {
    describe("Valid inputs", () => {
      it("should call next() for valid pagination params", () => {
        mockRequest.query = { page: "1", size: "10" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith();
        expect(logger.debug).toHaveBeenCalledWith("Validating pagination parameters", {
          page: "1",
          size: "10",
        });
        expect(logger.debug).toHaveBeenCalledWith("Pagination validation passed");
      });

      it("should accept query without pagination params", () => {
        mockRequest.query = {};

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith();
      });

      it("should accept only page parameter", () => {
        mockRequest.query = { page: "2" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith();
      });

      it("should accept only size parameter", () => {
        mockRequest.query = { size: "25" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith();
      });

      it("should accept maximum size of 100", () => {
        mockRequest.query = { size: "100" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith();
      });

      it("should accept minimum size of 1", () => {
        mockRequest.query = { size: "1" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith();
      });

      it("should accept large page numbers", () => {
        mockRequest.query = { page: "999" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith();
      });
    });

    describe("Invalid page parameter", () => {
      it("should reject negative page number with ValidationError", () => {
        mockRequest.query = { page: "-1" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: "Invalid page parameter",
          })
        );
        expect(nextFunction).toHaveBeenCalledWith(expect.any(ValidationError));
        expect(logger.warn).toHaveBeenCalledWith("Invalid page parameter rejected", {
          page: "-1",
          ip: "127.0.0.1",
          path: "/api/users",
        });
      });

      it("should reject zero page number", () => {
        mockRequest.query = { page: "0" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: "Invalid page parameter",
          })
        );
        expect(nextFunction).toHaveBeenCalledWith(expect.any(ValidationError));
      });

      it("should reject non-numeric page", () => {
        mockRequest.query = { page: "abc" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: "Invalid page parameter",
          })
        );
      });

      it("should reject decimal page numbers", () => {
        mockRequest.query = { page: "1.5" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: "Invalid page parameter",
          })
        );
      });

      it("should reject page with special characters", () => {
        mockRequest.query = { page: "1@#" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: "Invalid page parameter",
          })
        );
      });
    });

    describe("Invalid size parameter", () => {
      it("should reject size greater than max (101)", () => {
        mockRequest.query = { size: "101" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: "Invalid size parameter. Must be between 1 and 100",
          })
        );
        expect(nextFunction).toHaveBeenCalledWith(expect.any(ValidationError));
        expect(logger.warn).toHaveBeenCalledWith("Invalid size parameter rejected", {
          size: "101",
          maxSize: 100,
          ip: "127.0.0.1",
          path: "/api/users",
        });
      });

      it("should reject size of 0", () => {
        mockRequest.query = { size: "0" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: expect.stringContaining("Invalid size parameter"),
          })
        );
      });

      it("should reject negative size", () => {
        mockRequest.query = { size: "-5" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: expect.stringContaining("Invalid size parameter"),
          })
        );
      });

      it("should reject non-numeric size", () => {
        mockRequest.query = { size: "large" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: expect.stringContaining("Invalid size parameter"),
          })
        );
      });

      it("should reject very large size (1000)", () => {
        mockRequest.query = { size: "1000" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: expect.stringContaining("Invalid size parameter"),
          })
        );
      });
    });

    describe("Combined invalid parameters", () => {
      it("should reject invalid page first when both page and size are invalid", () => {
        mockRequest.query = { page: "-1", size: "101" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: "Invalid page parameter",
          })
        );
      });
    });

    describe("Logging behavior", () => {
      it("should log validation start with parameters", () => {
        mockRequest.query = { page: "2", size: "20" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(logger.debug).toHaveBeenCalledWith("Validating pagination parameters", {
          page: "2",
          size: "20",
        });
      });

      it("should log successful validation", () => {
        mockRequest.query = { page: "1", size: "10" };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(logger.debug).toHaveBeenCalledWith("Pagination validation passed");
      });

      it("should log rejection with context", () => {
        mockRequest = {
          query: { page: "-1" },
          method: "GET",
          path: "/api/users",
          ip: "192.168.1.100",
        };

        paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(logger.warn).toHaveBeenCalledWith("Invalid page parameter rejected", {
          page: "-1",
          ip: "192.168.1.100",
          path: "/api/users",
        });
      });
    });
  });

  describe("validateSort", () => {
    describe("Valid sort fields", () => {
      it('should call next() for valid sort field "name"', () => {
        mockRequest.query = { sort: "name" };

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith();
        expect(logger.debug).toHaveBeenCalledWith("Validating sort parameter", {
          sort: "name",
        });
        expect(logger.debug).toHaveBeenCalledWith("Sort validation passed", {
          sort: "name",
        });
      });

      it('should call next() for valid sort field "id"', () => {
        mockRequest.query = { sort: "id" };

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith();
      });

      it("should accept query without sort param", () => {
        mockRequest.query = {};

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith();
        expect(logger.debug).not.toHaveBeenCalledWith(
          "Validating sort parameter",
          expect.anything()
        );
      });
    });

    describe("Invalid sort fields", () => {
      it("should reject invalid sort field with ValidationError", () => {
        mockRequest.query = { sort: "invalid" };

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: "Invalid sort field. Valid fields: name, id",
          })
        );
        expect(nextFunction).toHaveBeenCalledWith(expect.any(ValidationError));
        expect(logger.warn).toHaveBeenCalledWith("Invalid sort field rejected", {
          sort: "invalid",
          validFields: ["name", "id"],
          ip: "127.0.0.1",
          path: "/api/users",
        });
      });

      it('should reject "email" as sort field', () => {
        mockRequest.query = { sort: "email" };

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: expect.stringContaining("Invalid sort field"),
          })
        );
      });

      it('should reject "age" as sort field', () => {
        mockRequest.query = { sort: "age" };

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: expect.stringContaining("Invalid sort field"),
          })
        );
      });

      it("should reject numeric sort field", () => {
        mockRequest.query = { sort: "123" };

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: expect.stringContaining("Invalid sort field"),
          })
        );
      });

      it("should reject sort with special characters", () => {
        mockRequest.query = { sort: "name@#$" };

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: expect.stringContaining("Invalid sort field"),
          })
        );
      });

      it("should reject empty string as sort", () => {
        mockRequest.query = { sort: "" };

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: expect.stringContaining("Invalid sort field"),
          })
        );
      });
    });

    describe("Case sensitivity", () => {
      it('should reject uppercase "NAME"', () => {
        mockRequest.query = { sort: "NAME" };

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: expect.stringContaining("Invalid sort field"),
          })
        );
      });

      it('should reject mixed case "Name"', () => {
        mockRequest.query = { sort: "Name" };

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 422,
            message: expect.stringContaining("Invalid sort field"),
          })
        );
      });
    });

    describe("Logging behavior", () => {
      it("should log validation start when sort present", () => {
        mockRequest.query = { sort: "name" };

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(logger.debug).toHaveBeenCalledWith("Validating sort parameter", {
          sort: "name",
        });
      });

      it("should log successful validation", () => {
        mockRequest.query = { sort: "id" };

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(logger.debug).toHaveBeenCalledWith("Sort validation passed", {
          sort: "id",
        });
      });

      it("should log rejection with valid fields list", () => {
        mockRequest = {
          query: { sort: "email" },
          method: "GET",
          path: "/api/users",
          ip: "10.0.0.1",
        };

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(logger.warn).toHaveBeenCalledWith("Invalid sort field rejected", {
          sort: "email",
          validFields: ["name", "id"],
          ip: "10.0.0.1",
          path: "/api/users",
        });
      });

      it("should not log validation when sort not present", () => {
        mockRequest.query = {};

        validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(logger.debug).not.toHaveBeenCalledWith(
          "Validating sort parameter",
          expect.anything()
        );
      });
    });
  });

  describe("Integration: Both validators together", () => {
    it("should pass both validators with valid params", () => {
      mockRequest.query = { page: "1", size: "10", sort: "name" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();

      // Clear the mock calls
      (nextFunction as jest.Mock).mockClear();

      validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it("should fail pagination first if both invalid", () => {
      mockRequest.query = { page: "-1", sort: "invalid" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
          message: "Invalid page parameter",
        })
      );
    });
  });
});
