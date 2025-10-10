import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LoadingSpinner } from "../../../components/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("should render loading spinner", () => {
    render(<LoadingSpinner />);

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.getByText("Loading users...")).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveAttribute("aria-label", "Loading");
  });
});
