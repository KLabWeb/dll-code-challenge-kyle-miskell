import request from "supertest";
import express from "express";
import indexRouter from "../../../src/routes/index.route";

// Helper to test formatUptime by mocking process.uptime
describe("Index Route - formatUptime function", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use("/", indexRouter);
  });

  it("should format uptime with days, hours, minutes, and seconds", async () => {
    // Mock uptime to be 1 day, 2 hours, 3 minutes, 45 seconds
    const originalUptime = process.uptime;
    const mockUptime = 1 * 86400 + 2 * 3600 + 3 * 60 + 45; // 93825 seconds
    process.uptime = jest.fn(() => mockUptime);

    const response = await request(app).get("/health").expect(200);

    expect(response.body.uptime.formatted).toBe("1d 2h 3m 45s");

    // Restore original
    process.uptime = originalUptime;
  });

  it("should format uptime with only hours, minutes, and seconds (no days)", async () => {
    // Mock uptime to be 5 hours, 30 minutes, 15 seconds (no days)
    const originalUptime = process.uptime;
    const mockUptime = 5 * 3600 + 30 * 60 + 15; // 19815 seconds
    process.uptime = jest.fn(() => mockUptime);

    const response = await request(app).get("/health").expect(200);

    expect(response.body.uptime.formatted).toBe("5h 30m 15s");

    // Restore original
    process.uptime = originalUptime;
  });

  it("should format uptime with only minutes and seconds (no days or hours)", async () => {
    // Mock uptime to be 45 minutes, 30 seconds
    const originalUptime = process.uptime;
    const mockUptime = 45 * 60 + 30; // 2730 seconds
    process.uptime = jest.fn(() => mockUptime);

    const response = await request(app).get("/health").expect(200);

    expect(response.body.uptime.formatted).toBe("45m 30s");

    // Restore original
    process.uptime = originalUptime;
  });

  it("should format uptime with only seconds (no days, hours, or minutes)", async () => {
    // Mock uptime to be 45 seconds
    const originalUptime = process.uptime;
    const mockUptime = 45;
    process.uptime = jest.fn(() => mockUptime);

    const response = await request(app).get("/health").expect(200);

    expect(response.body.uptime.formatted).toBe("45s");

    // Restore original
    process.uptime = originalUptime;
  });

  it("should handle zero hours correctly", async () => {
    // Test case where hours would be 0
    const originalUptime = process.uptime;
    const mockUptime = 0 * 3600 + 5 * 60 + 10; // 310 seconds (0h 5m 10s)
    process.uptime = jest.fn(() => mockUptime);

    const response = await request(app).get("/health").expect(200);

    // Should not include hours since it's 0
    expect(response.body.uptime.formatted).toBe("5m 10s");

    // Restore original
    process.uptime = originalUptime;
  });

  it("should handle multiple days correctly", async () => {
    // Test with 10 days
    const originalUptime = process.uptime;
    const mockUptime = 10 * 86400 + 1 * 3600 + 30 * 60 + 25; // 869425 seconds
    process.uptime = jest.fn(() => mockUptime);

    const response = await request(app).get("/health").expect(200);

    expect(response.body.uptime.formatted).toBe("10d 1h 30m 25s");

    // Restore original
    process.uptime = originalUptime;
  });
});
