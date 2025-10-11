import request from "supertest";
import app from "../../src/app";

describe("GET /api/health", () => {
  describe("Basic health check", () => {
    it("should return 200 status code", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.status).toBe(200);
    });

    it("should return JSON response", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.type).toBe("application/json");
    });

    it("should return healthy status", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body.status).toBe("healthy");
    });
  });

  describe("Response structure", () => {
    it("should contain required fields", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("memory");
      expect(response.body).toHaveProperty("version");
    });

    it("should have status field as string", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(typeof response.body.status).toBe("string");
      expect(response.body.status).toBe("healthy");
    });

    it("should have timestamp in ISO 8601 format", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body.timestamp).toBeDefined();
      expect(typeof response.body.timestamp).toBe("string");

      // Validate ISO 8601 format
      const date = new Date(response.body.timestamp);
      expect(date.toISOString()).toBe(response.body.timestamp);
    });

    it("should have uptime as object with seconds and formatted", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(typeof response.body.uptime).toBe("object");
      expect(typeof response.body.uptime.seconds).toBe("number");
      expect(response.body.uptime.seconds).toBeGreaterThan(0);
      expect(typeof response.body.uptime.formatted).toBe("string");
    });

    it("should have memory object with correct structure", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body.memory).toBeDefined();
      expect(typeof response.body.memory).toBe("object");
      expect(response.body.memory).toHaveProperty("rss");
      expect(response.body.memory).toHaveProperty("heapTotal");
      expect(response.body.memory).toHaveProperty("heapUsed");
      expect(response.body.memory).toHaveProperty("external");
    });

    it("should have version field as string", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(typeof response.body.version).toBe("string");
      expect(response.body.version.length).toBeGreaterThan(0);
    });
  });

  describe("Memory metrics", () => {
    it("should have memory values as formatted strings", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(typeof response.body.memory.rss).toBe("string");
      expect(response.body.memory.rss).toMatch(/\d+MB/);
      expect(typeof response.body.memory.heapTotal).toBe("string");
      expect(response.body.memory.heapTotal).toMatch(/\d+MB/);
      expect(typeof response.body.memory.heapUsed).toBe("string");
      expect(response.body.memory.heapUsed).toMatch(/\d+MB/);
      expect(typeof response.body.memory.external).toBe("string");
      expect(response.body.memory.external).toMatch(/\d+MB/);
    });

    it("should have positive memory values", async () => {
      const response = await request(app).get("/api/health").expect(200);

      const rss = parseInt(response.body.memory.rss);
      const heapTotal = parseInt(response.body.memory.heapTotal);
      const heapUsed = parseInt(response.body.memory.heapUsed);
      const external = parseInt(response.body.memory.external);

      expect(rss).toBeGreaterThan(0);
      expect(heapTotal).toBeGreaterThan(0);
      expect(heapUsed).toBeGreaterThan(0);
      expect(external).toBeGreaterThanOrEqual(0);
    });

    it("should have heapUsed less than or equal to heapTotal", async () => {
      const response = await request(app).get("/api/health").expect(200);

      const heapUsed = parseInt(response.body.memory.heapUsed);
      const heapTotal = parseInt(response.body.memory.heapTotal);

      expect(heapUsed).toBeLessThanOrEqual(heapTotal);
    });

    it("should have reasonable memory values", async () => {
      const response = await request(app).get("/api/health").expect(200);

      const rss = parseInt(response.body.memory.rss);
      const heapTotal = parseInt(response.body.memory.heapTotal);

      // RSS should be less than 1GB for a simple app
      expect(rss).toBeLessThan(1024);

      // Heap total should be less than 500MB
      expect(heapTotal).toBeLessThan(500);
    });
  });

  describe("Uptime metrics", () => {
    it("should have uptime greater than 0", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body.uptime.seconds).toBeGreaterThan(0);
      expect(response.body.uptime.formatted).toBeDefined();
    });

    it("should have increasing uptime on subsequent calls", async () => {
      const response1 = await request(app).get("/api/health").expect(200);

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response2 = await request(app).get("/api/health").expect(200);

      expect(response2.body.uptime.seconds).toBeGreaterThanOrEqual(response1.body.uptime.seconds);
    });

    it("should be measured in seconds", async () => {
      const response = await request(app).get("/api/health").expect(200);

      // Uptime should be a small number of seconds for tests
      expect(response.body.uptime.seconds).toBeLessThan(3600); // Less than 1 hour
      expect(response.body.uptime.formatted).toBeDefined();
      expect(typeof response.body.uptime.formatted).toBe("string");
    });
  });

  describe("Timestamp validation", () => {
    it("should have recent timestamp", async () => {
      const before = new Date();
      const response = await request(app).get("/api/health").expect(200);
      const after = new Date();

      const timestamp = new Date(response.body.timestamp);

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should have different timestamps on subsequent calls", async () => {
      const response1 = await request(app).get("/api/health").expect(200);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const response2 = await request(app).get("/api/health").expect(200);

      expect(response1.body.timestamp).not.toBe(response2.body.timestamp);
    });

    it("should have timestamp in UTC", async () => {
      const response = await request(app).get("/api/health").expect(200);

      // ISO 8601 format should end with 'Z' for UTC
      expect(response.body.timestamp).toMatch(/Z$/);
    });
  });

  describe("Version information", () => {
    it("should return version string", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body.version).toBeDefined();
      expect(typeof response.body.version).toBe("string");
    });

    it("should return consistent version across calls", async () => {
      const response1 = await request(app).get("/api/health").expect(200);
      const response2 = await request(app).get("/api/health").expect(200);

      expect(response1.body.version).toBe(response2.body.version);
    });

    it("should have version in semver format or default", async () => {
      const response = await request(app).get("/api/health").expect(200);

      // Should either be semver (x.y.z) or default '1.0.0'
      const semverPattern = /^\d+\.\d+\.\d+$/;
      expect(response.body.version).toMatch(semverPattern);
    });
  });

  describe("Multiple concurrent requests", () => {
    it("should handle multiple simultaneous health checks", async () => {
      const requests = Array(10)
        .fill(null)
        .map(() => request(app).get("/api/health"));

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("healthy");
      });
    });

    it("should return consistent structure for concurrent requests", async () => {
      const requests = Array(5)
        .fill(null)
        .map(() => request(app).get("/api/health"));

      const responses = await Promise.all(requests);

      const firstResponse = responses[0].body;
      responses.forEach((response) => {
        expect(Object.keys(response.body).sort()).toEqual(Object.keys(firstResponse).sort());
      });
    });
  });

  describe("HTTP methods", () => {
    it("should only respond to GET requests", async () => {
      await request(app).get("/api/health").expect(200);
    });

    it("should reject POST requests", async () => {
      await request(app).post("/api/health").expect(404);
    });

    it("should reject PUT requests", async () => {
      await request(app).put("/api/health").expect(404);
    });

    it("should reject DELETE requests", async () => {
      await request(app).delete("/api/health").expect(404);
    });

    it("should reject PATCH requests", async () => {
      await request(app).patch("/api/health").expect(404);
    });
  });

  describe("Response headers", () => {
    it("should have Content-Type application/json", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });

    it("should not cache health check responses", async () => {
      const response = await request(app).get("/api/health").expect(200);

      // Health checks should not be cached
      const cacheControl = response.headers["cache-control"];
      if (cacheControl) {
        expect(cacheControl).not.toContain("max-age");
      }
    });
  });

  describe("Performance", () => {
    it("should respond quickly (under 100ms)", async () => {
      const start = Date.now();
      await request(app).get("/api/health").expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it("should handle rapid successive requests", async () => {
      const responses: request.Response[] = [];

      for (let i = 0; i < 20; i++) {
        const response = await request(app).get("/api/health").expect(200);
        responses.push(response);
      }

      expect(responses).toHaveLength(20);
      responses.forEach((response) => {
        expect(response.body.status).toBe("healthy");
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle requests with query parameters", async () => {
      const response = await request(app).get("/api/health?foo=bar").expect(200);

      expect(response.body.status).toBe("healthy");
    });

    it("should handle requests with trailing slash", async () => {
      const response = await request(app).get("/api/health/").expect(200);

      expect(response.body.status).toBe("healthy");
    });

    it("should return valid JSON even with Accept header", async () => {
      const response = await request(app)
        .get("/api/health")
        .set("Accept", "application/json")
        .expect(200);

      expect(response.body.status).toBe("healthy");
    });
  });

  describe("Data consistency", () => {
    it("should have all memory fields with arrayBuffers property", async () => {
      const response = await request(app).get("/api/health").expect(200);

      // Node.js memory usage may include arrayBuffers
      if (response.body.memory.arrayBuffers !== undefined) {
        expect(typeof response.body.memory.arrayBuffers).toBe("number");
      }
    });

    it("should maintain data type consistency across multiple calls", async () => {
      const responses = await Promise.all([
        request(app).get("/api/health"),
        request(app).get("/api/health"),
        request(app).get("/api/health"),
      ]);

      responses.forEach((response) => {
        expect(typeof response.body.status).toBe("string");
        expect(typeof response.body.timestamp).toBe("string");
        expect(typeof response.body.uptime).toBe("object");
        expect(typeof response.body.uptime.seconds).toBe("number");
        expect(typeof response.body.uptime.formatted).toBe("string");
        expect(typeof response.body.memory).toBe("object");
        expect(typeof response.body.version).toBe("string");
      });
    });
  });

  describe("Error resilience", () => {
    it("should not fail with malformed headers", async () => {
      const response = await request(app).get("/api/health").set("X-Custom-Header", "").expect(200);

      expect(response.body.status).toBe("healthy");
    });

    it("should handle requests without user-agent", async () => {
      const response = await request(app).get("/api/health").set("User-Agent", "").expect(200);

      expect(response.body.status).toBe("healthy");
    });
  });

  describe("Formatted uptime variations", () => {
    it("should format uptime with days correctly", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body.uptime.formatted).toBeDefined();
      expect(typeof response.body.uptime.formatted).toBe("string");

      // The formatted string should always end with seconds
      expect(response.body.uptime.formatted).toMatch(/\d+s$/);
    });

    it("should format uptime consistently", async () => {
      const response = await request(app).get("/api/health").expect(200);

      const formatted = response.body.uptime.formatted;

      // Should have at least seconds in the format
      expect(formatted).toContain("s");

      // Verify it's a valid uptime format (combinations of d, h, m, s)
      expect(formatted).toMatch(/^(\d+d\s)?(\d+h\s)?(\d+m\s)?\d+s$/);
    });

    it("should handle various uptime ranges", async () => {
      const response = await request(app).get("/api/health").expect(200);

      const formatted = response.body.uptime.formatted;

      // For test environment, uptime should be small
      // Format should be reasonable (not empty, not malformed)
      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted).toMatch(/\d/); // Should contain at least one digit
    });
  });
});
