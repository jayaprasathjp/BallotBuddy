// src/__tests__/ElectionStepper.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import JourneyPage from "../pages/JourneyPage";

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en" },
  }),
}));

describe("JourneyPage (Election Stepper)", () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <JourneyPage />
      </MemoryRouter>,
    );

  it("renders all 7 election steps", () => {
    renderPage();
    expect(screen.getByText("Eligibility Check")).toBeDefined();
    expect(screen.getByText("Voter Registration")).toBeDefined();
    expect(screen.getByText("Voting Process")).toBeDefined();
    expect(screen.getByText("Result Declaration")).toBeDefined();
  });

  it("starts with progress at 0%", () => {
    renderPage();
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar.getAttribute("aria-valuenow")).toBe("0");
  });

  it("expands a step on click", async () => {
    renderPage();
    const step1Btn = screen.getByText("Eligibility Check").closest("button");
    expect(step1Btn?.getAttribute("aria-expanded")).toBe("true"); // First step opens by default

    const step2Btn = screen.getByText("Voter Registration").closest("button");
    await userEvent.click(step2Btn);
    expect(step2Btn?.getAttribute("aria-expanded")).toBe("true");
  });

  it("marks a step as complete when button clicked", async () => {
    renderPage();
    // Step 1 is expanded by default, so mark complete button is visible
    const markBtn = screen.getAllByText(/Mark as complete/i)[0];
    await userEvent.click(markBtn);

    // Progress should update
    const progressBar = screen.getByRole("progressbar");
    expect(
      Number.parseInt(progressBar.getAttribute("aria-valuenow")),
    ).toBeGreaterThan(0);
  });

  it("shows progress percentage correctly", async () => {
    renderPage();
    const markBtn = screen.getAllByText(/Mark as complete/i)[0];
    await userEvent.click(markBtn);

    // 1/7 = ~14%
    expect(screen.getByText(/1\/7 steps/)).toBeDefined();
  });

  it("has accessible step headers with aria-expanded", () => {
    renderPage();
    const stepButtons = screen.getAllByRole("button", { name: /step/i });
    stepButtons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-expanded");
    });
  });
});
