import { getUsers, buildPagingUrls } from "../../../src/services/user.service";

// Mock the data
jest.mock("../../../src/data/users", () => ({
  users: [
    { name: "Jorn", id: 0 },
    { name: "Markus", id: 3 },
    { name: "Andrew", id: 2 },
    { name: "Ori", id: 4 },
    { name: "Mike", id: 1 },
  ],
}));

describe("UserService", () => {
  describe("getUsers", () => {
    it("should return all users without sorting", () => {
      const result = getUsers({ page: 1, size: 10 });

      expect(result.users).toHaveLength(5);
      expect(result.totalResults).toBe(5);
    });

    it("should sort users by name", () => {
      const result = getUsers({ sort: "name", page: 1, size: 10 });

      expect(result.users[0].name).toBe("Andrew");
      expect(result.users[4].name).toBe("Ori");
    });

    it("should sort users by id", () => {
      const result = getUsers({ sort: "id", page: 1, size: 10 });

      expect(result.users[0].id).toBe(0);
      expect(result.users[4].id).toBe(4);
    });

    it("should paginate results correctly", () => {
      const result = getUsers({ page: 1, size: 2 });

      expect(result.users).toHaveLength(2);
      expect(result.totalResults).toBe(5);
    });

    it("should return correct page of results", () => {
      const page1 = getUsers({ page: 1, size: 2 });
      const page2 = getUsers({ page: 2, size: 2 });

      expect(page1.users[0].name).toBe("Jorn");
      expect(page2.users[0].name).toBe("Andrew");
    });

    it("should handle last page with fewer items", () => {
      const result = getUsers({ page: 3, size: 2 });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].name).toBe("Mike");
    });

    it("should return empty array for page beyond total", () => {
      const result = getUsers({ page: 10, size: 2 });

      expect(result.users).toHaveLength(0);
      expect(result.totalResults).toBe(5);
    });
  });

  describe("buildPagingUrls", () => {
    const baseUrl = "http://localhost:3001/api/users";

    it("should include next link when more pages exist", () => {
      const paging = buildPagingUrls({
        page: 1,
        size: 2,
        totalResults: 5,
        baseUrl,
      });

      expect(paging.next).toBe(`${baseUrl}?page=2&size=2`);
      expect(paging.previous).toBeUndefined();
    });

    it("should include previous link when not on first page", () => {
      const paging = buildPagingUrls({
        page: 2,
        size: 2,
        totalResults: 5,
        baseUrl,
      });

      expect(paging.previous).toBe(`${baseUrl}?page=1&size=2`);
      expect(paging.next).toBe(`${baseUrl}?page=3&size=2`);
    });

    it("should not include next link on last page", () => {
      const paging = buildPagingUrls({
        page: 3,
        size: 2,
        totalResults: 5,
        baseUrl,
      });

      expect(paging.previous).toBe(`${baseUrl}?page=2&size=2`);
      expect(paging.next).toBeUndefined();
    });

    it("should include sort parameter in pagination links", () => {
      const paging = buildPagingUrls({
        page: 1,
        size: 2,
        sort: "name",
        totalResults: 5,
        baseUrl,
      });

      expect(paging.next).toBe(`${baseUrl}?page=2&size=2&sort=name`);
    });

    it("should include totalResults", () => {
      const paging = buildPagingUrls({
        page: 1,
        size: 2,
        totalResults: 5,
        baseUrl,
      });

      expect(paging.totalResults).toBe(5);
    });
  });
});
