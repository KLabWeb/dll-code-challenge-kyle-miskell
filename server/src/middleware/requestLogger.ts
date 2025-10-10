import { Request, Response, NextFunction } from "express";
import logger from "../config/winstonLogger";

// Performance thresholds for financial API
const SLOW_REQUEST_THRESHOLD = 1000; // 1 second
const VERY_SLOW_REQUEST_THRESHOLD = 3000; // 3 seconds

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const isSlowRequest = duration > SLOW_REQUEST_THRESHOLD;
    const isVerySlowRequest = duration > VERY_SLOW_REQUEST_THRESHOLD;

    const logData = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      durationMs: duration, // Numeric value for monitoring tools
      slow: isSlowRequest,
      verySlow: isVerySlowRequest,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };

    // Log based on status code and performance
    if (res.statusCode >= 500) {
      logger.error("Request completed with server error", logData);
    } else if (res.statusCode >= 400) {
      logger.warn("Request completed with client error", logData);
    } else if (isVerySlowRequest) {
      logger.warn("Request completed - VERY SLOW", logData);
    } else if (isSlowRequest) {
      logger.warn("Request completed - SLOW", logData);
    } else {
      logger.http("Request completed", logData);
    }
  });

  next();
};
