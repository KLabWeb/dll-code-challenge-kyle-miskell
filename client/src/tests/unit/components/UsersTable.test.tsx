import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UsersTable } from "../../../components/UsersTable";
import { User } from "../../../types/user";

describe("UsersTable", () => {
  const mockUsers: User[] = [
    { id: 1, name: "Alice Johnson" },
    { id: 2, name: "Bob Smith" },
    { id: 3, name: "Charlie Brown" },
  ];

  it("should render table with users", () => {
    render(<UsersTable users={mockUsers} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    expect(screen.getByText("Charlie Brown")).toBeInTheDocument();
  });

  it("should render table headers", () => {
    render(<UsersTable users={mockUsers} />);

    expect(screen.getByRole("columnheader", { name: "ID" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
  });

  it("should render user IDs in cells", () => {
    render(<UsersTable users={mockUsers} />);

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");

    // Skip header row, check data rows
    expect(within(rows[1]).getByText("1")).toBeInTheDocument();
    expect(within(rows[2]).getByText("2")).toBeInTheDocument();
    expect(within(rows[3]).getByText("3")).toBeInTheDocument();
  });

  it("should display empty state when no users", () => {
    render(<UsersTable users={[]} />);

    expect(screen.getByText("No users found")).toBeInTheDocument();
  });

  it("should render correct number of rows", () => {
    render(<UsersTable users={mockUsers} />);

    const table = screen.getByRole("table");
    const tbody = within(table).getAllByRole("rowgroup")[1];
    const rows = within(tbody).getAllByRole("row");

    expect(rows).toHaveLength(3);
  });

  it("should apply hover styles to rows", () => {
    render(<UsersTable users={mockUsers} />);

    const table = screen.getByRole("table");
    const tbody = within(table).getAllByRole("rowgroup")[1];
    const rows = within(tbody).getAllByRole("row");

    rows.forEach((row) => {
      expect(row).toHaveClass("hover:bg-slate-50");
    });
  });
});
