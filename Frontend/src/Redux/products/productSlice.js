import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  selectedCategory: "chemical", // Default category
  lastUpdaetd: null,
};

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload; //action.payload should be array
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setLastUpdated: (state, action) => {
      state.lastUpdaetd = action.payload;
    }
  },
});

export const { setProducts, setSelectedCategory, setLastUpdated } = productSlice.actions;

export default productSlice.reducer;
