import rateLimit from "express-rate-limit";
import logger from "../config/winstonLogger";
import { TooManyRequestsError } from "./errorHandler";

// Use more lenient rate limiting in test/development environments
const isTestOrDev = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development";
const windowMS = isTestOrDev ? 1 * 60 * 1000 : 15 * 60 * 1000; // 1 minute for test/dev, 15 minutes for production
const maxRequests = isTestOrDev ? 1000 : 100; // 1000 requests for test/dev, 100 for production

export const rateLimiter = rateLimit({
  windowMs: windowMS,
  max: maxRequests,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      userAgent: req.get("user-agent"),
    });
    next(new TooManyRequestsError("Too many requests from this IP, please try again later."));
  },
});
