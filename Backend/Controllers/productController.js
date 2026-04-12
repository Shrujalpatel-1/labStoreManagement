import Product from "../Models/productModal.js";
import IssuedItem from "../Models/issueModal.js";

// ✅ Get all products of a specific category
export const getProductsByCategoryController = async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = [
      "chemical",
      "plasticware",
      "glassware",
      "teaching_kit",
      "miscellaneous",
    ];

    if (!validCategories.includes(category)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid category" });
    }

    const products = await Product.find({ category });

    return res.status(200).json({ status: true, data: products });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch products", error });
  }
};

// ✅ Insert product
export const insertProductController = async (req, res) => {
  const obj = req.body;

  try {
    // Validate category
    const validCategories = [
      "chemical",
      "plasticware",
      "glassware",
      "teaching_kit",
      "miscellaneous",
    ];
    if (!validCategories.includes(obj.category)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid category" });
    }

    // Category-specific validation
    // if (obj.category === "chemical" && !obj.dateOfExpiry) {
    //   return res
    //     .status(400)
    //     .json({ status: false, message: "Chemicals require expiry date" });
    // }

    await Product.create(obj);

    return res
      .status(200)
      .json({ status: true, message: "Product inserted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Failed to insert product", error });
  }
};

// ✅ Update product
export const updateProductController = async (req, res) => {
  const { productId, newdata } = req.body;
  try {
    await Product.findOneAndUpdate({ _id: productId }, newdata);
    return res
      .status(200)
      .json({ status: true, message: "Product updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Failed to update product", error });
  }
};

// ✅ Delete product
export const deleteProductController = async (req, res) => {
  const { productId } = req.body;

  try {
    await Product.deleteOne({ _id: productId });
    return res
      .status(200)
      .json({ status: true, message: "Product deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Failed to delete product", error });
  }
};

// ✅ Get all products (For Dropdowns)
export const getAllProductsController = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ name: 1 });
    return res.status(200).json({ status: true, data: products });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to fetch all products", error });
  }
};

// ✅ Get Global Last Updated Timestamp
export const getLastUpdatedController = async (req, res) => {
  try {
    // .lean() and .select() make this query extremely lightweight
    const latestProduct = await Product.findOne().sort({ updatedAt: -1 }).select('updatedAt').lean();
    const latestIssue = await IssuedItem.findOne().sort({ updatedAt: -1 }).select('updatedAt').lean();

    let lastUpdated = null;
    const pDate = latestProduct?.updatedAt;
    const iDate = latestIssue?.updatedAt;

    if (pDate && iDate) {
      lastUpdated = pDate > iDate ? pDate : iDate;
    } else {
      lastUpdated = pDate || iDate || null;
    }

    return res.status(200).json({ status: true, data: { lastUpdated } });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to fetch last updated date", error });
  }
};