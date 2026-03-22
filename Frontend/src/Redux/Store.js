import { combineReducers, configureStore } from "@reduxjs/toolkit";
import productReducer from "./products/productSlice";
import loginReducer from "./login/isLogin";
import issueReducer from "./issue/issueSlice";

const rootRecucer = combineReducers({
  product: productReducer,
  login: loginReducer,
  issue: issueReducer,
});
export const store = configureStore({
  reducer: rootRecucer,
});
