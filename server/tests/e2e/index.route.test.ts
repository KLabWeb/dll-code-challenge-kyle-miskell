import request from "supertest";
import app from "../../src/app";

describe("GET /api", () => {
  describe("Root API endpoint", () => {
    it("should return 200 status code", async () => {
      const response = await request(app).get("/api").expect(200);

      expect(response.status).toBe(200);
    });

    it("should return JSON response", async () => {
      const response = await request(app).get("/api").expect(200);

      expect(response.type).toBe("application/json");
    });

    it("should return message indicating API is running", async () => {
      const response = await request(app).get("/api").expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("API is running");
    });

    it("should have correct response structure", async () => {
      const response = await request(app).get("/api").expect(200);

      expect(response.body).toEqual({
        message: "API is running",
      });
    });
  });

  describe("HTTP methods", () => {
    it("should only respond to GET requests", async () => {
      await request(app).get("/api").expect(200);
    });

    it("should reject POST requests", async () => {
      await request(app).post("/api").expect(404);
    });

    it("should reject PUT requests", async () => {
      await request(app).put("/api").expect(404);
    });

    it("should reject DELETE requests", async () => {
      await request(app).delete("/api").expect(404);
    });
  });

  describe("Content type", () => {
    it("should return application/json content type", async () => {
      const response = await request(app).get("/api").expect(200);

      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });
  });

  describe("Multiple requests", () => {
    it("should handle multiple concurrent requests", async () => {
      const requests = Array(10)
        .fill(null)
        .map(() => request(app).get("/api"));

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("API is running");
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle requests with query parameters", async () => {
      const response = await request(app).get("/api?test=value").expect(200);

      expect(response.body.message).toBe("API is running");
    });

    it("should handle requests with trailing slash", async () => {
      const response = await request(app).get("/api/").expect(200);

      expect(response.body.message).toBe("API is running");
    });
  });
});
