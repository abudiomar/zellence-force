// @vitest-environment jsdom
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocaleDensityControls } from "./locale-density-controls";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() })
}));

describe("locale and density controls", () => {
  test("persist locale and density preferences", async () => {
    render(<LocaleDensityControls locale="ar" density="comfortable" />);

    await userEvent.selectOptions(screen.getByLabelText("Language"), "en");
    await userEvent.click(screen.getByRole("button", { name: "Compact" }));

    expect(document.cookie).toContain("zf_locale=en");
    expect(document.cookie).toContain("zf_density=compact");
  });
});
