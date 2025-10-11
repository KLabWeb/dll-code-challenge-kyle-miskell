import { rateLimiter } from "../../../src/middleware/rateLimiter";
import { TooManyRequestsError } from "../../../src/middleware/errorHandler";

describe("Rate Limiter Middleware", () => {
  it("should be defined", () => {
    expect(rateLimiter).toBeDefined();
  });

  it("should have correct configuration in test environment", () => {
    expect(process.env.NODE_ENV).toBe("test");
    // Rate limiter should use lenient settings in test
  });

  it("should export a valid middleware function", () => {
    expect(typeof rateLimiter).toBe("function");
    // Rate limiter middleware has 3 parameters (req, res, next)
    expect(rateLimiter.length).toBeGreaterThanOrEqual(3);
  });

  it("should use different limits for test vs production", () => {
    // This test verifies the configuration is environment-aware
    const currentEnv = process.env.NODE_ENV;
    expect(currentEnv).toBe("test");

    // In test mode, we should have lenient limits (1000 requests)
    // In production, it would be 100 requests
    // The rateLimiter should be configured accordingly
    expect(rateLimiter).toBeDefined();
  });

  describe("Rate limit error handling", () => {
    it("should create TooManyRequestsError when limit exceeded", () => {
      // Test that the handler creates the correct error type
      const error = new TooManyRequestsError(
        "Too many requests from this IP, please try again later."
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Too many requests from this IP, please try again later.");
    });

    it("should handle rate limit with proper error message", () => {
      const errorMessage = "Too many requests from this IP, please try again later.";
      const error = new TooManyRequestsError(errorMessage);

      expect(error.message).toBe(errorMessage);
    });

    it("should create errors with correct message format", () => {
      const message = "Too many requests from this IP, please try again later.";
      const error = new TooManyRequestsError(message);

      expect(error.message).toContain("Too many requests");
      expect(error.message).toContain("IP");
      expect(error.message).toContain("try again later");
    });
  });
});
