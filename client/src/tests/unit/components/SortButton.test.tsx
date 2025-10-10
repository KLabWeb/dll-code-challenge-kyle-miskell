import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { SortButton } from "../../../components/SortButton";

describe("SortButton", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it("should render button with children", () => {
    render(
      <SortButton field="name" currentSort="" onClick={mockOnClick}>
        Name
      </SortButton>
    );

    expect(screen.getByRole("button", { name: /Name/ })).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const user = userEvent.setup();
    render(
      <SortButton field="name" currentSort="" onClick={mockOnClick}>
        Name
      </SortButton>
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledWith("name");
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("should show active state when field matches currentSort", () => {
    render(
      <SortButton field="name" currentSort="name" onClick={mockOnClick}>
        Name
      </SortButton>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveClass("bg-blue-600");
  });

  it("should show inactive state when field does not match currentSort", () => {
    render(
      <SortButton field="name" currentSort="id" onClick={mockOnClick}>
        Name
      </SortButton>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveClass("bg-slate-100");
  });

  it("should display arrow icon when active", () => {
    const { container } = render(
      <SortButton field="name" currentSort="name" onClick={mockOnClick}>
        Name
      </SortButton>
    );

    // Check for the ArrowUpDown icon (lucide-react renders as svg)
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should not display arrow icon when inactive", () => {
    const { container } = render(
      <SortButton field="name" currentSort="" onClick={mockOnClick}>
        Name
      </SortButton>
    );

    const svg = container.querySelector("svg");
    expect(svg).not.toBeInTheDocument();
  });
});
