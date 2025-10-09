import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const userSlice = createSlice({
  name: "user",
  initialState: {
    accountId: null,
    role: null,
    token: null,
    authenticated: false,
    expiry: null,
  },
  reducers: {
    login(state, action) {
      state.accountId = action.payload.accountId;
      state.role = action.payload.role;
      state.token = action.payload.token;
      state.authenticated = action.payload.authenticated;
      state.expiry = action.payload.expiry;
    },
    logout(state) {
      state.accountId = null;
      state.role = null;
      state.token = null;
      state.authenticated = false;
      state.expiry = null;
    },
  },
});


export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
