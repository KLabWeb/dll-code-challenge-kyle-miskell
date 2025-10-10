import { User, PagingResponse, ApiResponse } from "../../types/user";

describe("User Types", () => {
  it("should create a valid User object", () => {
    const user: User = {
      id: 1,
      name: "Test User",
    };

    expect(user.id).toBe(1);
    expect(user.name).toBe("Test User");
  });

  it("should create a valid PagingResponse object", () => {
    const paging: PagingResponse = {
      totalResults: 100,
      next: "page=2",
      previous: "page=1",
    };

    expect(paging.totalResults).toBe(100);
    expect(paging.next).toBe("page=2");
    expect(paging.previous).toBe("page=1");
  });

  it("should create a valid ApiResponse object", () => {
    const response: ApiResponse = {
      data: [
        { id: 1, name: "User 1" },
        { id: 2, name: "User 2" },
      ],
      paging: {
        totalResults: 2,
      },
    };

    expect(response.data).toHaveLength(2);
    expect(response.paging.totalResults).toBe(2);
  });
});
