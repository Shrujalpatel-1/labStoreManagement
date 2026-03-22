import { Router } from "express";
import {
  getUserController,
  loginController,
  logoutController,
  registerController,
} from "../Controllers/authController.js";

import {
  getProductsByCategoryController,
  insertProductController,
  updateProductController,
  deleteProductController,
} from "../Controllers/productController.js";

import {
  getIssuedItemsController,
  createIssuedItemController,
  deleteIssuedItemController,
} from "../Controllers/issueController.js";

import authMiddleware from "../Middleware/authMiddleware.js";

export const route = Router();

//
// 🧾 AUTH ENDPOINTS
//
route.post("/login", loginController);
route.post("/register", registerController);
route.get("/logout", logoutController);
route.get("/getUser", authMiddleware, getUserController);

//
// 📦 PRODUCT ENDPOINTS
//
/**
 * Category-based product routes:
 *  GET    /products/:category      → Get all products in a specific category
 *  POST   /products/insert         → Add new product
 *  POST   /products/update         → Update product
 *  POST   /products/delete         → Delete product
 */

// Get products by category (e.g. /products/chemical)
route.get(
  "/products/:category",
  authMiddleware,
  getProductsByCategoryController
);

// Add a new product
route.post("/products/insert", authMiddleware, insertProductController);

// Update an existing product
route.post("/products/update", authMiddleware, updateProductController);

// Delete a product
route.post("/products/delete", authMiddleware, deleteProductController);

//
//  ISSUE ENDPOINTS
//
route.get("/getissue", authMiddleware, getIssuedItemsController);
route.post("/createissue", authMiddleware, createIssuedItemController);
route.post("/deleteissue", authMiddleware, deleteIssuedItemController);
export default route;
