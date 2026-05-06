import Product from "../Models/productModal.js";
import IssuedItem from "../Models/issueModal.js";
import Log from "../Models/logModel.js";
import User from "../Models/userModel.js";

// ✅ Migration Controller (Run once to sync old data)
export const runMigration = async (req, res) => {
  try {
    // 1. Migrate Roles: lab_coordinator -> lab_oc
    await User.updateMany(
      { role: "lab_coordinator" },
      { $set: { role: "lab_oc" } }
    );

    // 2. Normalize Chemical Quantities: numeric -> string
    const chemicals = await Product.find({ category: "chemical" });
    for (const chem of chemicals) {
      if (typeof chem.quantityAvailable === "number") {
        const newStatus = chem.quantityAvailable > 0 ? "yes" : "no";
        await Product.findByIdAndUpdate(chem._id, { quantityAvailable: newStatus });
      }
    }

    // 3. Normalize Other Quantities: ensure they are Numbers
    const nonChemicals = await Product.find({ category: { $ne: "chemical" } });
    for (const item of nonChemicals) {
      if (typeof item.quantityAvailable === "string") {
        let numVal = Number(item.quantityAvailable);
        if (isNaN(numVal)) numVal = 0;
        await Product.findByIdAndUpdate(item._id, { quantityAvailable: numVal });
      }
    }

    return res.status(200).json({ status: true, message: "Migration completed successfully. Roles and Quantities normalized." });
  } catch (error) {
    console.error("Migration Error:", error);
    return res.status(500).json({ status: false, message: "Migration failed", error: error.message });
  }
};

// ✅ Get activity logs (Paginated + Search + Last 6 months)
export const getLogsController = async (req, res) => {
  try {
    if (req.user.role === "faculty") {
      return res.status(403).json({ status: false, message: "Forbidden: Faculty cannot access activity logs." });
    }
    const { page = 1, limit = 50, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sixMonthAgo = new Date();
    sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

    // Build Query
    const query = {
      createdAt: { $gte: sixMonthAgo }
    };

    if (search) {
      query.productName = { $regex: search, $options: "i" };
    }

    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalLogs = await Log.countDocuments(query);

    return res.status(200).json({ 
      status: true, 
      data: logs,
      total: totalLogs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalLogs / limit)
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to fetch logs", error });
  }
};

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
  if (req.user.role === "faculty") {
    return res.status(403).json({ status: false, message: "Forbidden: Faculty cannot insert products." });
  }
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

    const product = await Product.create(obj);

    // Record Log
    await Log.create({
      productId: product._id,
      productName: product.name,
      category: product.category,
      action: "Added",
      details: `Product added with category: ${product.category}`,
      performedBy: req.user.email,
    });

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
  if (req.user.role === "faculty") {
    return res.status(403).json({ status: false, message: "Forbidden: Faculty cannot update products." });
  }
  const { productId, newdata } = req.body;
  try {
    const oldProduct = await Product.findById(productId);
    if (!oldProduct) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate({ _id: productId }, newdata, { new: true });
    
    if (updatedProduct) {
      // Generate detailed change list
      const changes = [];
      for (const key in newdata) {
        let oldVal = oldProduct[key];
        let newVal = newdata[key];

        // Date-Aware Comparison
        if (oldVal instanceof Date || (key.toLowerCase().includes("date") && oldVal)) {
          const oldDateStr = new Date(oldVal).toISOString().split("T")[0];
          const newDateStr = new Date(newVal).toISOString().split("T")[0];
          
          if (oldDateStr === newDateStr) continue; // Skip if same day
          
          oldVal = oldDateStr;
          newVal = newDateStr;
        }

        if (String(oldVal) !== String(newVal)) {
          changes.push(`${key}: "${oldVal || "N/A"}" → "${newVal}"`);
        }
      }

      // Record Detailed Log
      await Log.create({
        productId: updatedProduct._id,
        productName: updatedProduct.name,
        category: updatedProduct.category,
        action: "Updated",
        details: changes.length > 0 ? `Changed: ${changes.join(" | ")}` : "No values changed (Saved without edits)",
        performedBy: req.user.email,
      });
    }

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
  if (req.user.role === "faculty") {
    return res.status(403).json({ status: false, message: "Forbidden: Faculty cannot delete products." });
  }
  const { productId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (product) {
      // Record Log
      await Log.create({
        productName: product.name,
        category: product.category,
        action: "Deleted",
        details: `Product removed from ${product.category}`,
        performedBy: req.user.email,
      });
    }

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