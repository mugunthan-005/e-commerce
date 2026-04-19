import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token") || "",
  user: JSON.parse(localStorage.getItem("user") || "null")
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("token", state.token);
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    logout(state) {
      state.token = "";
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;