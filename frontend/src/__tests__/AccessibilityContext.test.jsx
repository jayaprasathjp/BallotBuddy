// src/__tests__/AccessibilityContext.test.jsx
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import {
  AccessibilityProvider,
  useAccessibility,
} from "../context/AccessibilityContext";

const TestComponent = () => {
  const {
    highContrast,
    setHighContrast,
    fontScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
  } = useAccessibility();
  return (
    <div>
      <div data-testid="contrast">{highContrast ? "high" : "normal"}</div>
      <div data-testid="scale">{Math.round(fontScale * 100)}</div>
      <button onClick={() => setHighContrast((v) => !v)}>
        Toggle Contrast
      </button>
      <button onClick={increaseFontSize}>Increase</button>
      <button onClick={decreaseFontSize}>Decrease</button>
      <button onClick={resetFontSize}>Reset</button>
    </div>
  );
};

describe("AccessibilityContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with normal contrast", () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );
    expect(screen.getByTestId("contrast").textContent).toBe("normal");
  });

  it("toggles high contrast mode", async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );
    await userEvent.click(screen.getByText("Toggle Contrast"));
    expect(screen.getByTestId("contrast").textContent).toBe("high");
    expect(document.documentElement.classList.contains("high-contrast")).toBe(
      true,
    );
  });

  it("starts with 100% font scale", () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );
    expect(screen.getByTestId("scale").textContent).toBe("100");
  });

  it("increases font size up to 150%", async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );
    await userEvent.click(screen.getByText("Increase"));
    expect(
      Number.parseInt(screen.getByTestId("scale").textContent),
    ).toBeGreaterThan(100);
  });

  it("decreases font size", async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );
    await userEvent.click(screen.getByText("Decrease"));
    expect(
      Number.parseInt(screen.getByTestId("scale").textContent),
    ).toBeLessThan(100);
  });

  it("resets font size to 100%", async () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>,
    );
    await userEvent.click(screen.getByText("Increase"));
    await userEvent.click(screen.getByText("Reset"));
    expect(screen.getByTestId("scale").textContent).toBe("100");
  });
});
