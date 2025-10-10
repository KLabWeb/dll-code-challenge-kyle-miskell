import { userApi } from "../../../services/userApi";

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("userApi", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("getUsers", () => {
    it("should fetch users with default parameters", async () => {
      const mockResponse = {
        data: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ],
        paging: {
          totalResults: 2,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await userApi.getUsers(1, 10);

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/users?page=1&size=10");
      expect(result).toEqual(mockResponse);
    });

    it("should fetch users with sort parameter", async () => {
      const mockResponse = {
        data: [{ id: 1, name: "Alice" }],
        paging: { totalResults: 1 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await userApi.getUsers(1, 10, "name");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/users?page=1&size=10&sort=name"
      );
    });

    it("should throw error when fetch fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      } as Response);

      await expect(userApi.getUsers(1, 10)).rejects.toThrow(
        "Failed to fetch users: Internal Server Error"
      );
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(userApi.getUsers(1, 10)).rejects.toThrow("Network error");
    });
  });
});
