import { Request, Response, NextFunction } from "express";
import logger from "../config/winstonLogger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific error classes for different scenarios with error codes
export class ValidationError extends AppError {
  constructor(message: string) {
    super(422, message, "VALIDATION_ERROR", true); // 422 Unprocessable Entity
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message, "BAD_REQUEST", true); // 400 Bad Request
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(404, message, "NOT_FOUND", true); // 404 Not Found
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(401, message, "UNAUTHORIZED", true); // 401 Unauthorized
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(403, message, "FORBIDDEN", true); // 403 Forbidden
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, "CONFLICT", true); // 409 Conflict
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too many requests") {
    super(429, message, "TOO_MANY_REQUESTS", true); // 429 Too Many Requests
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const requestId = req.id;

  if (err instanceof AppError) {
    // Log operational errors as warnings
    logger.warn("Operational error occurred", {
      requestId,
      code: err.code,
      statusCode: err.statusCode,
      message: err.message,
      errorType: err.constructor.name,
      path: req.path,
      method: req.method,
      ip: req.ip,
      query: req.query,
    });

    return res.status(err.statusCode).json({
      status: "error",
      code: err.code || "UNKNOWN_ERROR",
      message: err.message,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }

  // Log unexpected errors with full details
  logger.error("Unexpected error occurred", {
    requestId,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    query: req.query,
    body: req.body,
    headers: req.headers,
  });

  return res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
    requestId,
    timestamp: new Date().toISOString(),
  });
};
