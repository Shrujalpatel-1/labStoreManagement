import { createSlice } from "@reduxjs/toolkit";

// --- 1. Helper to check existing session on load ---
const getInitialState = () => {
  const authData = localStorage.getItem("mnnit_auth_data");
  if (authData) {
    const parsedData = JSON.parse(authData);
    // Check if current time is BEFORE expiry time
    if (Date.now() < parsedData.expiry) {
      return {
        loginStatus: true,
        role: parsedData.role,
      };
    } else {
      // Expired: clear it
      localStorage.removeItem("mnnit_auth_data");
    }
  }
  return {
    loginStatus: false,
    role: null,
  };
};

export const loginSlice = createSlice({
  name: "login",
  initialState: getInitialState(), // Initialize with helper
  reducers: {
    setLoginData: (state, action) => {
      state.loginStatus = action.payload.status;
      state.role = action.payload.role;
      // We handle localStorage setting in Auth.jsx, not here, to keep reducer pure
    },
    logout: (state) => {
      state.loginStatus = false;
      state.role = null;
      localStorage.removeItem("mnnit_auth_data"); // Clear storage
    },
  },
});

export const { setLoginData, logout } = loginSlice.actions;
export default loginSlice.reducer;
