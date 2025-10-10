import { Request, Response, NextFunction } from "express";
import { getUsers } from "../../src/controllers/user.controller";
import * as userService from "../../src/services/user.service";

jest.mock("../../src/services/user.service");

describe("UserController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
      protocol: "http",
      get: jest.fn().mockReturnValue("localhost:3001"),
      baseUrl: "/api/users",
    };
    mockResponse = {
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return paginated users with paging metadata", async () => {
    mockRequest.query = { page: "1", size: "2" };

    const mockUsers = [
      { name: "Jorn", id: 0 },
      { name: "Markus", id: 3 },
    ];

    const mockPaging = {
      totalResults: 5,
      next: "http://localhost:3001/api/users?page=2&size=2",
    };

    (userService.getUsers as jest.Mock).mockReturnValue({
      users: mockUsers,
      totalResults: 5,
    });

    (userService.buildPagingUrls as jest.Mock).mockReturnValue(mockPaging);

    await getUsers(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(userService.getUsers).toHaveBeenCalledWith({
      sort: undefined,
      page: 1,
      size: 2,
    });

    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockUsers,
      paging: mockPaging,
    });
  });

  it("should handle sort parameter", async () => {
    mockRequest.query = { sort: "name" };

    (userService.getUsers as jest.Mock).mockReturnValue({
      users: [],
      totalResults: 0,
    });

    (userService.buildPagingUrls as jest.Mock).mockReturnValue({
      totalResults: 0,
    });

    await getUsers(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(userService.getUsers).toHaveBeenCalledWith({
      sort: "name",
      page: 1,
      size: 10,
    });
  });

  it("should call next() with error on service failure", async () => {
    const error = new Error("Service error");
    (userService.getUsers as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await getUsers(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(error);
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});
