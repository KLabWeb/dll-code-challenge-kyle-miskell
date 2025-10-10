import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import logger from "../config/winstonLogger";

/**
 * Middleware to add unique request ID for audit trails and distributed tracing
 * Critical for finance systems to track requests across microservices
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if request already has an ID (from upstream service)
  const existingId = req.headers["x-request-id"] as string;
  const requestId = existingId || randomUUID();

  // Attach to request object for use in other middleware/controllers
  req.id = requestId;

  // Return in response headers for client correlation
  res.setHeader("X-Request-ID", requestId);

  logger.debug("Request ID assigned", {
    requestId,
    fromUpstream: !!existingId,
  });

  next();
};
