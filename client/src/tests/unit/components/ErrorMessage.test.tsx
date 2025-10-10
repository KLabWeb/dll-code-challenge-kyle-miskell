import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ErrorMessage } from "../../../components/ErrorMessage";

describe("ErrorMessage", () => {
  it("should render error message", () => {
    render(<ErrorMessage message="Something went wrong" />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Error loading users")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should display custom error message", () => {
    const customMessage = "Network connection failed";
    render(<ErrorMessage message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it("should have proper accessibility role", () => {
    render(<ErrorMessage message="Error" />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });
});
