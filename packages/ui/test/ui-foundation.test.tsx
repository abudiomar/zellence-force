// @vitest-environment jsdom
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AlertBanner,
  Button,
  DataTable,
  Drawer,
  Field,
  IconButton,
  RosterList,
  ScreenState,
  SpreadsheetGrid,
  StatusBadge,
  UI_DENSITIES,
  UI_STATUS_TONES,
  UI_TOKENS
} from "../src";

describe("UI foundation tokens", () => {
  test("defines semantic tokens with capped radius and density values", () => {
    expect(UI_DENSITIES).toEqual(["comfortable", "compact"]);
    expect(UI_STATUS_TONES).toContain("review");
    expect(UI_TOKENS.radius.md).toBe("8px");
    expect(Number.parseInt(UI_TOKENS.radius.md, 10)).toBeLessThanOrEqual(8);
    expect(UI_TOKENS.color.primary).toMatch(/^#/);
  });
});

describe("UI primitives", () => {
  test("renders accessible buttons, fields, statuses, and screen states", async () => {
    const onClick = vi.fn();
    render(
      <div>
        <Button onClick={onClick}>Save</Button>
        <IconButton label="Close" onClick={onClick}>x</IconButton>
        <Field label="Email" error="Required">
          <input />
        </Field>
        <StatusBadge tone="success" label="Active" />
        <AlertBanner tone="danger" title="Error" />
        <ScreenState state="empty" title="No rows" />
      </div>
    );

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClick).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Required")).toHaveAttribute("role", "alert");
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("No rows")).toBeInTheDocument();
  });

  test("renders asChild buttons with a single slotted child", () => {
    render(
      <Button asChild>
        <a href="/staff">Staff pool</a>
      </Button>
    );

    expect(screen.getByRole("link", { name: "Staff pool" })).toHaveAttribute("href", "/staff");
  });

  test("renders data table, spreadsheet grid, and roster list", async () => {
    const activate = vi.fn();
    render(
      <div>
        <DataTable
          rows={[{ id: "1", name: "Sara" }]}
          getRowId={(row) => row.id}
          columns={[{ id: "name", header: "Name", cell: (row) => row.name, sortable: true }]}
          onRowActivate={activate}
        />
        <SpreadsheetGrid
          rows={[{ id: "r1", worker: "Noura", amount: "100" }]}
          getRowId={(row) => row.id}
          columns={[
            { id: "worker", header: "Worker", cell: (row) => row.worker, sticky: true },
            { id: "amount", header: "Amount", cell: (row) => row.amount, state: "dirty" }
          ]}
        />
        <RosterList
          rows={[{ id: "a1", title: "Ali", meta: "Host", status: "Confirmed", actionLabel: "Open" }]}
          onAction={() => activate("a1")}
        />
      </div>
    );

    await userEvent.keyboard("{Tab}{Enter}");

    expect(screen.getByRole("table", { name: "Data table" })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: "Spreadsheet grid" })).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  test("renders accessible drawer dialog", () => {
    render(<Drawer open title="Details" onOpenChange={() => undefined}>Body</Drawer>);

    expect(screen.getByRole("dialog", { name: "Details" })).toBeInTheDocument();
  });
});
