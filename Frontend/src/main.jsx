import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Dashboard from "./Pages/Dashboard/Dashboard.jsx";
// Import the new components
import IssueProduct from "./Pages/IssueProduct/IssueProduct.jsx"; // Renamed from NewSales
import ViewIssued from "./Pages/ViewIssued/ViewIssued.jsx"; // Renamed from ViewSales

import { Provider } from "react-redux";
import { store } from "./Redux/Store.js";
import Auth from "./Pages/Auth/Auth.jsx";
import Profile from "./Pages/Profile/Profile.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="" element={<Dashboard />} />
      <Route path="/login" element={<Auth />} />
      {/* Updated routes for issuing products */}
      <Route path="/issue-product" element={<IssueProduct />} />
      <Route path="/view-issued" element={<ViewIssued />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
