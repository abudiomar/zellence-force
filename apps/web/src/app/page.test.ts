import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

vi.mock("../components/protected-shell", () => ({
  ProtectedShell: ({ children }: { children: ReactNode }) => children
}));

import Page from "./page";

describe("Next app page", () => {
  test("renders Zell-force shell content", () => {
    const html = renderToStaticMarkup(createElement(Page));

    expect(html).toContain("Zell-force");
    expect(html).toContain("Event staffing operations");
  });
});
