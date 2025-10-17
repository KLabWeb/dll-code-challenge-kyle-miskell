import dotenv from "dotenv";
import path from "path";

// Load environment variables - MUST be before other imports
dotenv.config({ path: path.join(__dirname, "../.env") });

import app from "./config/express";
import routes from "./routes/index.route";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { requestIdMiddleware } from "./middleware/requestId";
import logger from "./config/winstonLogger";

// Log startup using version info
logger.info("Application starting...", {
  nodeVersion: process.version,
  environment: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3001,
});

// Middleware - CORRECT ORDER - Applies to all API calls
app.use(requestIdMiddleware); // Request ID FIRST (for tracing)
app.use(requestLogger); // Logger SECOND (logs with request ID)
app.use("/api/v1", routes); // Routes THIRD - versioned API (primary)
app.use("/api", routes); // Backward compatibility - unversioned route
app.use(errorHandler); // Error handler LAST

const port = process.env.PORT || 3001;
const host = process.env.HOST || "localhost";

// Only start server if this file is run directly (not imported by tests)
if (require.main === module) {
  const server = app.listen(port, () => {
    logger.info("Server started successfully", {
      url: `http://${host}:${port}`,
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    });
  });

  // Graceful shutdown configuration
  const SHUTDOWN_TIMEOUT = 5000; // 5 seconds

  const gracefulShutdown = (signal: string) => {
    logger.info(`${signal} signal received: starting graceful shutdown`);

    // Stop accepting new requests
    server.close(() => {
      logger.info("HTTP server closed - all connections terminated");
      process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      logger.error("Graceful shutdown timeout - forcing shutdown", {
        timeout: SHUTDOWN_TIMEOUT,
        signal,
      });
      process.exit(1);
    }, SHUTDOWN_TIMEOUT);
  };

  // Log shutdown events
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Log unhandled errors
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection", {
      reason,
      promise,
    });
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", {
      message: error.message,
      stack: error.stack,
    });
    // Exit process after logging
    process.exit(1);
  });
}

export default app;
