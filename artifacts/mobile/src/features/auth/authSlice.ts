import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthRole = "client" | "vendor";

export type AuthState = {
  role: AuthRole;
  vendorId: number | null;
  clientId: number | null;
  token: string | null;
};

const initialState: AuthState = {
  role: "client",
  vendorId: null,
  clientId: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    vendorLoggedIn: (state, action: PayloadAction<{ vendorId: number; token: string }>) => {
      state.role = "vendor";
      state.vendorId = action.payload.vendorId;
      state.token = action.payload.token;
    },
    clientSessionReady: (state, action: PayloadAction<{ clientId: number; token: string }>) => {
      state.clientId = action.payload.clientId;
      state.token = state.role === "client" ? action.payload.token : state.token;
    },
    loggedOut: (state) => {
      state.role = "client";
      state.vendorId = null;
      state.clientId = null;
      state.token = null;
    },
  },
});

export const { vendorLoggedIn, clientSessionReady, loggedOut } = authSlice.actions;
export default authSlice.reducer;