import { describe, it, expect, vi, beforeEach } from "vitest";

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

// Mock ThemedIcon to avoid ThemeProvider dependency in tests
vi.mock("../../../src/components/icons/index", () => ({
  ThemedIcon: () => null,
}));

// Mock auth to avoid AuthProvider dependency
vi.mock("../../../src/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { username: "test-user", landingPagePreference: "home" },
    logout: vi.fn(),
  }),
}));

// Mock TV mode hook; individual tests can override via closure
let mockIsTVMode = false;
let mockToggleTVMode = vi.fn();

vi.mock("../../../src/hooks/useTVMode", () => ({
  useTVMode: () => ({ isTVMode: mockIsTVMode, toggleTVMode: mockToggleTVMode }),
}));

import { render, waitFor } from "@testing-library/react";
import { act, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "../../../src/components/ui/Sidebar";

describe("Sidebar auto-collapse / expand", () => {
  beforeEach(() => {
    mockIsTVMode = false;
    mockToggleTVMode = vi.fn();
    vi.clearAllMocks();
  });

  it("starts collapsed and calls onExpandedChange(true/false) on hover when not in TV mode", async () => {
    const onExpandedChange = vi.fn();

    const { container } = render(
      <MemoryRouter>
        <Sidebar navPreferences={[]} onExpandedChange={onExpandedChange} />
      </MemoryRouter>
    );

    const aside = container.querySelector("aside");
    expect(aside).toBeTruthy();

    // initial collapsed
    await waitFor(() => {
      expect(onExpandedChange).toHaveBeenCalled();
      expect(onExpandedChange).toHaveBeenLastCalledWith(false);
    });

    // hover expands
    fireEvent.mouseOver(aside!);
    await waitFor(() => {
      expect(onExpandedChange).toHaveBeenLastCalledWith(true);
    });

    // leaving collapses
    fireEvent.mouseOut(aside!);
    await waitFor(() => {
      expect(onExpandedChange).toHaveBeenLastCalledWith(false);
    });
  });

  it("in TV mode, expands when mainNav zone becomes active (tvZoneChange) and collapses when it deactivates", async () => {
    mockIsTVMode = true;

    const onExpandedChange = vi.fn();

    render(
      <MemoryRouter>
        <Sidebar navPreferences={[]} onExpandedChange={onExpandedChange} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(onExpandedChange).toHaveBeenCalled();
      expect(onExpandedChange).toHaveBeenLastCalledWith(false);
    });

    act(() => {
      window.dispatchEvent(new CustomEvent("tvZoneChange", { detail: { zone: "mainNav" } }));
    });
    await waitFor(() => {
      expect(onExpandedChange).toHaveBeenLastCalledWith(true);
    });

    act(() => {
      window.dispatchEvent(new CustomEvent("tvZoneChange", { detail: { zone: "grid" } }));
    });
    await waitFor(() => {
      expect(onExpandedChange).toHaveBeenLastCalledWith(false);
    });
  });
});
