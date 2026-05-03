// src/__tests__/AuthContext.test.jsx
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";
import * as api from "../services/api";

vi.mock("../services/api", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    me: vi.fn(),
  },
}));

const TestComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? "authenticated" : "unauthenticated"}
      </div>
      <div data-testid="user-name">{user?.name || "none"}</div>
      <button onClick={() => login("test@example.com", "password123")}>  
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("starts unauthenticated", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(screen.getByTestId("auth-status").textContent).toBe(
      "unauthenticated",
    );
    expect(screen.getByTestId("user-name").textContent).toBe("none");
  });

  it("authenticates on successful login", async () => {
    api.authApi.login.mockResolvedValue({
      data: {
        token: "test-token-123",
        user: {
          userId: "1",
          email: "test@example.com",
          name: "Test User",
          role: "user",
        },
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-status").textContent).toBe(
        "authenticated",
      );
      expect(screen.getByTestId("user-name").textContent).toBe("Test User");
    });

    expect(localStorage.getItem("ballotbuddy_token")).toBe("test-token-123");
  });

  it("clears state on logout", async () => {
    api.authApi.login.mockResolvedValue({
      data: { token: "test-token", user: { name: "Test", email: "t@t.com" } },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText("Login"));
    await waitFor(() =>
      expect(screen.getByTestId("auth-status").textContent).toBe(
        "authenticated",
      ),
    );

    await userEvent.click(screen.getByText("Logout"));
    expect(screen.getByTestId("auth-status").textContent).toBe(
      "unauthenticated",
    );
    expect(localStorage.getItem("ballotbuddy_token")).toBeNull();
  });

  it("persists auth state from localStorage", () => {
    localStorage.setItem("ballotbuddy_token", "stored-token");
    localStorage.setItem(
      "ballotbuddy_user",
      JSON.stringify({ name: "Stored User", email: "s@s.com" }),
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(screen.getByTestId("auth-status").textContent).toBe("authenticated");
    expect(screen.getByTestId("user-name").textContent).toBe("Stored User");
  });

  it("throws when useAuth is used outside provider", () => {
    const originalError = console.error;
    console.error = vi.fn();
    expect(() => render(<TestComponent />)).toThrow();
    console.error = originalError;
  });
});
