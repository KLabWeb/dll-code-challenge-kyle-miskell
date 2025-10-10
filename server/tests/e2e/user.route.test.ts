import request from "supertest";
import app from "../../src/app";

describe("GET /api/users", () => {
  describe("Pagination", () => {
    it("should return default pagination (page=1, size=10)", async () => {
      const response = await request(app).get("/api/users").expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.paging.totalResults).toBe(50);
      expect(response.body.paging.next).toBeDefined();
    });

    it("should handle custom page size", async () => {
      const response = await request(app).get("/api/users?size=5").expect(200);

      expect(response.body.data).toHaveLength(5);
    });

    it("should reject size exceeding max limit", async () => {
      const response = await request(app).get("/api/users?size=101").expect(422);

      expect(response.body.message || response.body.error).toContain("Invalid size parameter");
    });

    it("should handle last page correctly", async () => {
      const response = await request(app).get("/api/users?page=5&size=10").expect(200);

      expect(response.body.paging.next).toBeUndefined();
      expect(response.body.paging.previous).toBeDefined();
    });

    it("should handle page beyond available data", async () => {
      const response = await request(app).get("/api/users?page=100&size=10").expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.paging.totalResults).toBe(50);
      expect(response.body.paging.next).toBeUndefined();
      expect(response.body.paging.previous).toBeDefined();
    });

    it("should handle size=1 edge case", async () => {
      const response = await request(app).get("/api/users?page=1&size=1").expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.paging.totalResults).toBe(50);
      expect(response.body.paging.next).toBeDefined();
      expect(response.body.paging.previous).toBeUndefined();
    });

    it("should handle middle page correctly", async () => {
      const response = await request(app).get("/api/users?page=3&size=10").expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.paging.previous).toBeDefined();
      expect(response.body.paging.next).toBeDefined();
    });

    it("should handle last page with partial results", async () => {
      const response = await request(app).get("/api/users?page=3&size=20").expect(200);

      expect(response.body.data).toHaveLength(10); // 50 total, page 3 of size 20 = 10 remaining
      expect(response.body.paging.previous).toBeDefined();
      expect(response.body.paging.next).toBeUndefined();
    });
  });

  describe("Sorting", () => {
    it("should sort users by name", async () => {
      const response = await request(app).get("/api/users?sort=name").expect(200);

      const names = response.body.data.map((u: any) => u.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it("should sort users by id", async () => {
      const response = await request(app).get("/api/users?sort=id").expect(200);

      const ids = response.body.data.map((u: any) => u.id);
      const sortedIds = [...ids].sort((a, b) => a - b);
      expect(ids).toEqual(sortedIds);
    });

    it("should reject invalid sort field", async () => {
      const response = await request(app).get("/api/users?sort=invalid").expect(422);

      expect(response.body.message || response.body.error).toContain("Invalid sort field");
    });

    it("should sort with size=1", async () => {
      const response = await request(app).get("/api/users?sort=name&size=1").expect(200);

      expect(response.body.data).toHaveLength(1);
      const firstName = response.body.data[0].name;

      // Verify it's actually sorted by checking next page
      const response2 = await request(app).get("/api/users?sort=name&size=1&page=2").expect(200);

      const secondName = response2.body.data[0].name;
      expect(firstName.localeCompare(secondName)).toBeLessThan(0);
    });
  });

  describe("Sorting + Pagination Integration", () => {
    it("should combine sorting by name with pagination", async () => {
      const response = await request(app).get("/api/users?sort=name&page=2&size=10").expect(200);

      expect(response.body.data).toHaveLength(10);

      // Verify sorting is maintained across pages
      const names = response.body.data.map((u: any) => u.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);

      // Verify pagination links include sort parameter
      expect(response.body.paging.previous).toContain("sort=name");
      expect(response.body.paging.next).toContain("sort=name");
    });

    it("should combine sorting by id with pagination", async () => {
      const response = await request(app).get("/api/users?sort=id&page=3&size=15").expect(200);

      expect(response.body.data).toHaveLength(15);

      // Verify sorting is maintained
      const ids = response.body.data.map((u: any) => u.id);
      const sortedIds = [...ids].sort((a, b) => a - b);
      expect(ids).toEqual(sortedIds);

      // Verify pagination links include sort parameter
      expect(response.body.paging.previous).toContain("sort=id");
      expect(response.body.paging.next).toContain("sort=id");
    });

    it("should maintain sort order on first page", async () => {
      const response = await request(app).get("/api/users?sort=name&page=1&size=5").expect(200);

      const names = response.body.data.map((u: any) => u.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);

      // First page should not have previous link
      expect(response.body.paging.previous).toBeUndefined();
      expect(response.body.paging.next).toBeDefined();
      expect(response.body.paging.next).toContain("sort=name");
    });

    it("should maintain sort order on last page", async () => {
      const response = await request(app).get("/api/users?sort=id&page=5&size=10").expect(200);

      const ids = response.body.data.map((u: any) => u.id);
      const sortedIds = [...ids].sort((a, b) => a - b);
      expect(ids).toEqual(sortedIds);

      // Last page should not have next link
      expect(response.body.paging.next).toBeUndefined();
      expect(response.body.paging.previous).toBeDefined();
      expect(response.body.paging.previous).toContain("sort=id");
    });

    it("should handle sort with custom page size", async () => {
      const response = await request(app).get("/api/users?sort=name&page=2&size=7").expect(200);

      expect(response.body.data).toHaveLength(7);

      const names = response.body.data.map((u: any) => u.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it("should verify sort consistency across multiple pages", async () => {
      // Get first page sorted by name
      const page1 = await request(app).get("/api/users?sort=name&page=1&size=10").expect(200);

      // Get second page sorted by name
      const page2 = await request(app).get("/api/users?sort=name&page=2&size=10").expect(200);

      const lastNamePage1 = page1.body.data[9].name;
      const firstNamePage2 = page2.body.data[0].name;

      // Last name on page 1 should come before first name on page 2
      expect(lastNamePage1.localeCompare(firstNamePage2)).toBeLessThanOrEqual(0);
    });

    it("should handle large page number with sort", async () => {
      const response = await request(app).get("/api/users?sort=id&page=100&size=10").expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.paging.totalResults).toBe(50);
    });

    it("should handle size=1 with sorting on middle page", async () => {
      const response = await request(app).get("/api/users?sort=name&page=25&size=1").expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.paging.previous).toBeDefined();
      expect(response.body.paging.next).toBeDefined();
      expect(response.body.paging.previous).toContain("sort=name");
      expect(response.body.paging.next).toContain("sort=name");
    });

    it("should return correct total results with sort and pagination", async () => {
      const response = await request(app).get("/api/users?sort=id&page=2&size=15").expect(200);

      expect(response.body.paging.totalResults).toBe(50);
      expect(response.body.data.length).toBeLessThanOrEqual(15);
    });
  });

  describe("Error Handling", () => {
    it("should reject negative page number", async () => {
      const response = await request(app).get("/api/users?page=-1").expect(422);

      expect(response.body.message || response.body.error).toContain("Invalid page parameter");
    });

    it("should reject invalid page format", async () => {
      const response = await request(app).get("/api/users?page=abc").expect(422);

      expect(response.body.message || response.body.error).toContain("Invalid page parameter");
    });

    it("should reject decimal page number", async () => {
      const response = await request(app).get("/api/users?page=1.5").expect(422);

      expect(response.body.message || response.body.error).toContain("Invalid page parameter");
    });

    it("should reject page with special characters", async () => {
      const response = await request(app).get("/api/users?page=1@#").expect(422);

      expect(response.body.message || response.body.error).toContain("Invalid page parameter");
    });

    it("should reject negative size", async () => {
      const response = await request(app).get("/api/users?size=-5").expect(422);

      expect(response.body.message || response.body.error).toContain("Invalid size parameter");
    });

    it("should reject zero size", async () => {
      const response = await request(app).get("/api/users?size=0").expect(422);

      expect(response.body.message || response.body.error).toContain("Invalid size parameter");
    });

    it("should reject invalid sort field", async () => {
      const response = await request(app).get("/api/users?sort=email").expect(422);

      expect(response.body.message || response.body.error).toContain("Invalid sort field");
    });

    it("should reject empty sort parameter", async () => {
      const response = await request(app).get("/api/users?sort=").expect(422);

      expect(response.body.message || response.body.error).toContain("Invalid sort field");
    });

    it("should reject sort with special characters", async () => {
      const response = await request(app).get("/api/users?sort=name@#$").expect(422);

      expect(response.body.message || response.body.error).toContain("Invalid sort field");
    });

    it("should reject multiple invalid parameters", async () => {
      const response = await request(app)
        .get("/api/users?page=-1&size=101&sort=invalid")
        .expect(422);

      // Should fail on first validation error (page)
      expect(response.body.message || response.body.error).toBeDefined();
    });
  });

  describe("Response Format", () => {
    it("should return correct response structure", async () => {
      const response = await request(app).get("/api/users").expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("paging");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.paging).toBe("object");
    });

    it("should return correct paging structure", async () => {
      const response = await request(app).get("/api/users?page=2&size=10").expect(200);

      expect(response.body.paging).toHaveProperty("totalResults");
      expect(response.body.paging).toHaveProperty("previous");
      expect(response.body.paging).toHaveProperty("next");
      expect(typeof response.body.paging.totalResults).toBe("number");
    });

    it("should return users with correct structure", async () => {
      const response = await request(app).get("/api/users?size=1").expect(200);

      const user = response.body.data[0];
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("id");
      expect(typeof user.name).toBe("string");
      expect(typeof user.id).toBe("number");
    });
  });

  describe("Rate Limiting", () => {
    it("should allow requests within rate limit", async () => {
      // Make a few requests that should succeed
      for (let i = 0; i < 5; i++) {
        await request(app).get("/api/users").expect(200);
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle page 1 with size equal to total results", async () => {
      const response = await request(app).get("/api/users?page=1&size=50").expect(200);

      expect(response.body.data).toHaveLength(50);
      expect(response.body.paging.previous).toBeUndefined();
      expect(response.body.paging.next).toBeUndefined();
    });

    it("should handle page 1 with size greater than total results", async () => {
      const response = await request(app).get("/api/users?page=1&size=100").expect(200);

      expect(response.body.data).toHaveLength(50);
      expect(response.body.paging.previous).toBeUndefined();
      expect(response.body.paging.next).toBeUndefined();
    });

    it("should handle very large page numbers", async () => {
      const response = await request(app).get("/api/users?page=999999&size=10").expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.paging.totalResults).toBe(50);
    });

    it("should handle minimum valid values", async () => {
      const response = await request(app).get("/api/users?page=1&size=1").expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.paging.totalResults).toBe(50);
    });

    it("should handle maximum valid size", async () => {
      const response = await request(app).get("/api/users?page=1&size=100").expect(200);

      expect(response.body.data).toHaveLength(50);
      expect(response.body.paging.totalResults).toBe(50);
    });
  });

  describe("Query Parameter Combinations", () => {
    it("should handle all valid parameters together", async () => {
      const response = await request(app).get("/api/users?page=2&size=15&sort=name").expect(200);

      expect(response.body.data).toHaveLength(15);
      expect(response.body.paging.totalResults).toBe(50);
      expect(response.body.paging.previous).toContain("sort=name");
      expect(response.body.paging.next).toContain("sort=name");

      // Verify sorting
      const names = response.body.data.map((u: any) => u.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it("should handle sort and size without page", async () => {
      const response = await request(app).get("/api/users?size=5&sort=id").expect(200);

      expect(response.body.data).toHaveLength(5);

      // Verify sorting by id
      const ids = response.body.data.map((u: any) => u.id);
      const sortedIds = [...ids].sort((a, b) => a - b);
      expect(ids).toEqual(sortedIds);
    });

    it("should handle page and sort without size", async () => {
      const response = await request(app).get("/api/users?page=2&sort=name").expect(200);

      expect(response.body.data).toHaveLength(10); // default size

      // Verify sorting
      const names = response.body.data.map((u: any) => u.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });
  });
});
