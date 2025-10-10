import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import App from "../../App";

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Suppress act warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: An update to") &&
      args[0].includes("was not wrapped in act")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe("App Integration Tests", () => {
  const mockUsersResponse = {
    data: [
      { id: 1, name: "Alice Johnson" },
      { id: 2, name: "Bob Smith" },
      { id: 3, name: "Charlie Brown" },
    ],
    paging: {
      totalResults: 3,
      next: null,
      previous: null,
    },
  };

  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUsersResponse,
    } as Response);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial rendering", () => {
    it("should render the application", async () => {
      render(<App />);

      expect(screen.getByText("DLL User Management")).toBeInTheDocument();
      expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();
    });

    it("should fetch users on mount", async () => {
      render(<App />);

      await screen.findByText("Alice Johnson");

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/users?page=1&size=10");
    });
  });

  describe("Error handling", () => {
    it("should display error when fetch fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      } as Response);

      render(<App />);

      expect(await screen.findByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch users/)).toBeInTheDocument();
    });
  });

  describe("Sorting", () => {
    it("should sort by name when button clicked", async () => {
      const user = userEvent.setup();
      render(<App />);

      await screen.findByText("Alice Johnson");

      const nameButton = screen.getByRole("button", { name: /Name/ });
      await user.click(nameButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:3001/api/users?page=1&size=10&sort=name"
        );
      });
    });
  });

  describe("Pagination", () => {
    it("should navigate to next page", async () => {
      const user = userEvent.setup();
      const paginatedResponse = {
        data: mockUsersResponse.data,
        paging: {
          totalResults: 100,
          next: "page=2",
          previous: null,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => paginatedResponse,
      } as Response);

      render(<App />);

      await screen.findByText("Alice Johnson");

      mockFetch.mockClear();
      const nextButton = screen.getByRole("button", { name: "Go to next page" });
      await user.click(nextButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/users?page=2&size=10");
      });
    });
  });

  describe("Page size", () => {
    it("should change page size", async () => {
      const user = userEvent.setup();
      render(<App />);

      await screen.findByText("Alice Johnson");

      mockFetch.mockClear();
      const select = screen.getByLabelText("Show:");
      await user.selectOptions(select, "25");

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("http://localhost:3001/api/users?page=1&size=25");
      });
    });
  });
});
