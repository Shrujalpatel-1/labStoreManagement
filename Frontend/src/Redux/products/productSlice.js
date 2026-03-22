import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  selectedCategory: "chemical", // Default category
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
  },
});

export const { setProducts, setSelectedCategory } = productSlice.actions;

export default productSlice.reducer;
