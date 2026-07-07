import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppUser, TokenPair } from "@civicvision/shared-types";

const STORAGE_KEY = "civicvision.auth";

interface AuthState {
  user: AppUser | null;
  tokens: TokenPair | null;
}

function loadPersistedState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, tokens: null };
    return JSON.parse(raw) as AuthState;
  } catch {
    return { user: null, tokens: null };
  }
}

function persistState(state: AuthState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded) —
    // auth still works for the current session, it just won't survive a reload.
  }
}

const initialState: AuthState = loadPersistedState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AppUser; tokens: TokenPair }>) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      persistState(state);
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      persistState(state);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
