import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import authReducer, { setCredentials, logout } from "./auth.slice";
import type { AppUser, TokenPair } from "@civicvision/shared-types";

describe("auth.slice", () => {
  const mockUser: AppUser = {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    role: "USER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockTokens: TokenPair = {
    accessToken: "access-token",
    refreshToken: "refresh-token",
  };

  const initialState = {
    user: null,
    tokens: null,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("reducers", () => {
    it("should return the initial state", () => {
      expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    it("should handle setCredentials", () => {
      const payload = { user: mockUser, tokens: mockTokens };
      const nextState = authReducer(initialState, setCredentials(payload));

      expect(nextState.user).toEqual(mockUser);
      expect(nextState.tokens).toEqual(mockTokens);

      const persistedState = JSON.parse(localStorage.getItem("civicvision.auth") || "{}");
      expect(persistedState).toEqual(nextState);
    });

    it("should handle logout", () => {
      const loggedInState = { user: mockUser, tokens: mockTokens };
      const nextState = authReducer(loggedInState, logout());

      expect(nextState.user).toBeNull();
      expect(nextState.tokens).toBeNull();

      const persistedState = JSON.parse(localStorage.getItem("civicvision.auth") || "{}");
      expect(persistedState).toEqual(nextState);
    });
  });

  describe("localStorage fallback", () => {
    it("should handle setCredentials when localStorage throws", () => {
      // Mock localStorage.setItem to throw an error
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("localStorage quota exceeded");
      });

      const payload = { user: mockUser, tokens: mockTokens };
      const nextState = authReducer(initialState, setCredentials(payload));

      expect(nextState.user).toEqual(mockUser);
      expect(nextState.tokens).toEqual(mockTokens);

      // Verify it was called but didn't crash
      expect(setItemSpy).toHaveBeenCalled();
      setItemSpy.mockRestore();
    });

    it("should handle logout when localStorage throws", () => {
      // Mock localStorage.setItem to throw an error
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("localStorage quota exceeded");
      });

      const loggedInState = { user: mockUser, tokens: mockTokens };
      const nextState = authReducer(loggedInState, logout());

      expect(nextState.user).toBeNull();
      expect(nextState.tokens).toBeNull();

      // Verify it was called but didn't crash
      expect(setItemSpy).toHaveBeenCalled();
      setItemSpy.mockRestore();
    });
  });
});
