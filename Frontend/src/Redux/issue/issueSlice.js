import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  issuedItems: [],
};

export const issueSlice = createSlice({
  name: "issue",
  initialState,
  reducers: {
    setIssuedItems: (state, action) => {
      state.issuedItems = action.payload;
    },
  },
});

export const { setIssuedItems } = issueSlice.actions;

export default issueSlice.reducer;
