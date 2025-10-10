import express, { Request, Response } from "express";
import userRoutes from "./user.route";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is running" });
});

router.use("/users", userRoutes);

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check endpoint
 *     description: Returns the health status of the API, including uptime, memory usage, and environment information. Useful for monitoring and DevOps.
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get("/health", (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = process.uptime();

  res.status(200).json({
    status: "healthy",
    service: "user-management-api",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptimeSeconds),
      formatted: formatUptime(uptimeSeconds),
    },
    environment: process.env.NODE_ENV || "development",
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
    },
  });
});

// Helper function to format uptime
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${secs}s`);

  return parts.join(" ");
}

export default router;
