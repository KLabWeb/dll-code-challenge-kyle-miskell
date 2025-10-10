import { Request, Response, NextFunction } from "express";
import { paginationValidator, validateSort } from "../../../src/middleware/paginationValidator";
import { ValidationError } from "../../../src/middleware/errorHandler";

describe("Validation Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = { query: {}, method: "GET", path: "/api/users", ip: "127.0.0.1" };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe("paginationValidator", () => {
    it("should call next() for valid pagination params", () => {
      mockRequest.query = { page: "1", size: "10" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

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

    it("should reject size greater than max", () => {
      mockRequest.query = { size: "101" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
          message: "Invalid size parameter. Must be between 1 and 100",
        })
      );
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

    it("should accept query without pagination params", () => {
      mockRequest.query = {};

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).toHaveBeenCalledTimes(1);
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

    it("should accept both valid page and size", () => {
      mockRequest.query = { page: "3", size: "50" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });
  });

  describe("validateSort", () => {
    it("should call next() for valid sort field", () => {
      mockRequest.query = { sort: "name" };

      validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should call next() for valid sort field "id"', () => {
      mockRequest.query = { sort: "id" };

      validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

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

    it("should accept query without sort param", () => {
      mockRequest.query = {};

      validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

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

  describe("Combined validation scenarios", () => {
    it("should validate both pagination and sort together", () => {
      mockRequest.query = { page: "2", size: "15", sort: "name" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();

      (nextFunction as jest.Mock).mockClear();

      validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it("should fail on first invalid parameter (page)", () => {
      mockRequest.query = { page: "-1", size: "50", sort: "name" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
          message: "Invalid page parameter",
        })
      );
    });

    it("should validate size after valid page", () => {
      mockRequest.query = { page: "1", size: "101" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
          message: expect.stringContaining("Invalid size parameter"),
        })
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle whitespace in page parameter", () => {
      mockRequest.query = { page: " 1 " };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      // Whitespace should be trimmed by sanitization and then pass validation
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it("should handle whitespace in size parameter", () => {
      mockRequest.query = { size: " 10 " };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      // Whitespace should be trimmed by sanitization and then pass validation
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it("should handle leading zeros in page", () => {
      mockRequest.query = { page: "01" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      // Leading zeros are valid digits
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it("should handle leading zeros in size", () => {
      mockRequest.query = { size: "010" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      // Leading zeros are valid digits, and 010 = 10 which is valid
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it("should handle very large numbers that exceed MAX_SAFE_INTEGER", () => {
      mockRequest.query = { page: "99999999999999999999" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      // Should still be valid as it's all digits
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });

  describe("Error instance validation", () => {
    it("should pass ValidationError instance for invalid page", () => {
      mockRequest.query = { page: "abc" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(422);
      expect(error.isOperational).toBe(true);
    });

    it("should pass ValidationError instance for invalid size", () => {
      mockRequest.query = { size: "0" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(422);
    });

    it("should pass ValidationError instance for invalid sort", () => {
      mockRequest.query = { sort: "invalid" };

      validateSort(mockRequest as Request, mockResponse as Response, nextFunction);

      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(422);
      expect(error.message).toContain("Invalid sort field");
    });
  });

  describe("Multiple invalid parameters", () => {
    it("should catch page error first when both page and size are invalid", () => {
      mockRequest.query = { page: "-1", size: "101" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
          message: "Invalid page parameter",
        })
      );
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it("should catch size error when page is valid but size is invalid", () => {
      mockRequest.query = { page: "1", size: "200" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
          message: expect.stringContaining("Invalid size parameter"),
        })
      );
    });
  });

  describe("Boundary value testing", () => {
    it("should accept page = 1 (minimum valid)", () => {
      mockRequest.query = { page: "1" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it("should accept size = 1 (minimum valid)", () => {
      mockRequest.query = { size: "1" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it("should accept size = 100 (maximum valid)", () => {
      mockRequest.query = { size: "100" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it("should reject size = 101 (just over maximum)", () => {
      mockRequest.query = { size: "101" };

      paginationValidator(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
        })
      );
    });
  });
});
