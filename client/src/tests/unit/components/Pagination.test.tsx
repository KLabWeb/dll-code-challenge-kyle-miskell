import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Pagination } from "../../../components/Pagination";

describe("Pagination", () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  it("should render pagination information", () => {
    render(
      <Pagination
        currentPage={1}
        totalResults={100}
        pageSize={10}
        hasNext={true}
        hasPrevious={false}
        onPageChange={mockOnPageChange}
      />
    );

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Showing 1 to 10 of 100 users");
  });

  it("should render navigation buttons", () => {
    render(
      <Pagination
        currentPage={2}
        totalResults={100}
        pageSize={10}
        hasNext={true}
        hasPrevious={true}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeInTheDocument();
  });

  it("should disable previous button on first page", () => {
    render(
      <Pagination
        currentPage={1}
        totalResults={100}
        pageSize={10}
        hasNext={true}
        hasPrevious={false}
        onPageChange={mockOnPageChange}
      />
    );

    const prevButton = screen.getByRole("button", { name: "Go to previous page" });
    expect(prevButton).toBeDisabled();
  });

  it("should disable next button on last page", () => {
    render(
      <Pagination
        currentPage={10}
        totalResults={100}
        pageSize={10}
        hasNext={false}
        hasPrevious={true}
        onPageChange={mockOnPageChange}
      />
    );

    const nextButton = screen.getByRole("button", { name: "Go to next page" });
    expect(nextButton).toBeDisabled();
  });

  it("should call onPageChange when previous button clicked", async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        currentPage={2}
        totalResults={100}
        pageSize={10}
        hasNext={true}
        hasPrevious={true}
        onPageChange={mockOnPageChange}
      />
    );

    const prevButton = screen.getByRole("button", { name: "Go to previous page" });
    await user.click(prevButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it("should call onPageChange when next button clicked", async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        currentPage={1}
        totalResults={100}
        pageSize={10}
        hasNext={true}
        hasPrevious={false}
        onPageChange={mockOnPageChange}
      />
    );

    const nextButton = screen.getByRole("button", { name: "Go to next page" });
    await user.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it("should render page number buttons", () => {
    render(
      <Pagination
        currentPage={3}
        totalResults={100}
        pageSize={10}
        hasNext={true}
        hasPrevious={true}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 3" })).toBeInTheDocument();
  });

  it("should call onPageChange when page number clicked", async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        currentPage={1}
        totalResults={100}
        pageSize={10}
        hasNext={true}
        hasPrevious={false}
        onPageChange={mockOnPageChange}
      />
    );

    const page5Button = screen.getByRole("button", { name: "Go to page 5" });
    await user.click(page5Button);

    expect(mockOnPageChange).toHaveBeenCalledWith(5);
  });

  it("should indicate current page visually", () => {
    render(
      <Pagination
        currentPage={3}
        totalResults={100}
        pageSize={10}
        hasNext={true}
        hasPrevious={true}
        onPageChange={mockOnPageChange}
      />
    );

    const page3Button = screen.getByRole("button", { name: "Go to page 3" });
    expect(page3Button).toHaveAttribute("aria-current", "page");
    expect(page3Button).toHaveClass("bg-blue-600");
  });

  it("should display correct range for middle pages", () => {
    render(
      <Pagination
        currentPage={5}
        totalResults={1000}
        pageSize={10}
        hasNext={true}
        hasPrevious={true}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByRole("button", { name: "Go to page 3" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 4" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 6" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 7" })).toBeInTheDocument();
  });

  it("should have proper navigation landmark", () => {
    render(
      <Pagination
        currentPage={1}
        totalResults={100}
        pageSize={10}
        hasNext={true}
        hasPrevious={false}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
  });

  it("should announce status to screen readers", () => {
    render(
      <Pagination
        currentPage={2}
        totalResults={50}
        pageSize={10}
        hasNext={true}
        hasPrevious={true}
        onPageChange={mockOnPageChange}
      />
    );

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
  });
});
