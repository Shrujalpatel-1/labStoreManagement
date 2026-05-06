import IssuedItem from "../Models/issueModal.js";
import Product from "../Models/productModal.js";
import Log from "../Models/logModel.js";

export const getIssuedItemsController = async (req, res) => {
  try {
    // Find all documents in the IssuedItem collection
    const allIssuedItems = await IssuedItem.find({});

    return res.status(200).json({ status: true, data: allIssuedItems });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: false, message: "Failed getting issued items data" });
  }
};

export const createIssuedItemController = async (req, res) => {
  try {
    if (req.user.role === "faculty") {
      return res.status(403).json({ status: false, message: "Forbidden: Faculty cannot issue items." });
    }
    const {
      productId, // Added productId
      productName,
      quantity,
      studentName,
      registrationNumber,
      course,
      isReturnable,
      issueDate,
      expectedReturnDate,
      isAvailableAfterIssue, // New field for chemicals
    } = req.body;

    // 1. Find the product first to check its category
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    let updatedProduct;
    let finalQuantity = 1;

    if (product.category === "chemical") {
      // For chemicals, we check if it's currently available
      const isCurrentlyAvailable = product.quantityAvailable !== "no" && product.quantityAvailable !== 0 && product.quantityAvailable !== "0";
      
      if (!isCurrentlyAvailable) {
        return res.status(400).json({ 
          status: false, 
          message: "Chemical is already issued or not available." 
        });
      }
      
      // Update based on the choice from the frontend
      // If user says "yes" it is still available, we keep it "yes"
      // If user says "no", we set it to "no"
      const newStatus = isAvailableAfterIssue === "no" ? "no" : "yes";

      updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { quantityAvailable: newStatus },
        { new: true }
      );
      finalQuantity = 1; // Record 1 unit issued in the database
    } else {
      const numQuantity = Number(quantity);
      // ATOMIC UPDATE: Find the product ONLY if it has enough stock, and decrement it.
      updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, quantityAvailable: { $gte: numQuantity } },
        { $inc: { quantityAvailable: -numQuantity } },
        { new: true } 
      );
      finalQuantity = numQuantity;
    }

    if (!updatedProduct) {
      return res.status(400).json({ 
        status: false, 
        message: "Failed to issue. Stock is 0 or insufficient quantity available." 
      });
    }

    // 2. CREATE ISSUE RECORD
    const newItemData = {
      productId,
      productName,
      quantity: finalQuantity,
      studentName,
      registrationNumber,
      course,
      isReturnable,
    };

    if (issueDate) {
      newItemData.issueDate = issueDate;
    }
    if (isReturnable && expectedReturnDate) {
      newItemData.returnDate = expectedReturnDate;
    }

    const issuedItem = await IssuedItem.create(newItemData);

    // Record Log
    await Log.create({
      productId: product._id,
      productName: product.name,
      category: product.category,
      action: "Issued",
      details: `Issued ${finalQuantity} to ${studentName} (${registrationNumber}). Still Available: ${updatedProduct.quantityAvailable}`,
      performedBy: req.user.email,
    });

    return res.status(200).json({
      status: true,
      message: "Item issued successfully & stock updated",
      data: issuedItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Failed to issue item" });
  }
};

// ... other controllers ...

export const deleteIssuedItemController = async (req, res) => {
  try {
    if (req.user.role === "faculty") {
      return res.status(403).json({ status: false, message: "Forbidden: Faculty cannot delete issued items." });
    }
    // This 'issueId' variable now holds the '_id' sent from the frontend
    const { issueId } = req.body;

    if (!issueId) {
      return res
        .status(400)
        .json({ status: false, message: "issueId is required" });
    }

    // FIX 3: Change 'issueId: issueId' to '_id: issueId'
    // This tells Mongoose to find the document where its _id matches the ID we sent.
    const result = await IssuedItem.deleteOne({ _id: issueId });

    // Check if anything was actually deleted
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No item found with that issueId" });
    }

    return res
      .status(200)
      .json({ status: true, message: "Issued item deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: false, message: "Failed to delete item", error });
  }
};

export const returnIssuedItemController = async (req, res) => {
  try {
    if (req.user.role === "faculty") {
      return res.status(403).json({ status: false, message: "Forbidden: Faculty cannot return issued items." });
    }
    const { issueId } = req.body;

    if (!issueId) {
      return res.status(400).json({ status: false, message: "issueId is required" });
    }

    // 1. Find the issued item
    const issuedItem = await IssuedItem.findById(issueId);
    
    if (!issuedItem) {
      return res.status(404).json({ status: false, message: "Issued item not found" });
    }
    if (!issuedItem.isReturnable) {
      return res.status(400).json({ status: false, message: "This item is strictly non-returnable" });
    }
    if (issuedItem.isReturned) {
      return res.status(400).json({ status: false, message: "Item has already been returned" });
    }

    // 2. ATOMIC UPDATE: Increment the product's available stock
    const product = await Product.findById(issuedItem.productId);
    let updatedProduct;

    if (product && product.category === "chemical") {
      updatedProduct = await Product.findByIdAndUpdate(
        issuedItem.productId,
        { quantityAvailable: "yes" },
        { new: true }
      );
    } else {
      updatedProduct = await Product.findOneAndUpdate(
        { _id: issuedItem.productId },
        { $inc: { quantityAvailable: issuedItem.quantity } },
        { new: true }
      );
    }

    // If product was deleted from DB in the meantime, we still allow marking the issue as returned
    if (!updatedProduct) {
      console.warn(`Product ID ${issuedItem.productId} not found. Marking issue as returned anyway.`);
    }

    // 3. Mark the issue as returned
    issuedItem.isReturned = true;
    issuedItem.actualReturnDate = new Date();
    await issuedItem.save();

    // Record Log
    await Log.create({
      productId: issuedItem.productId,
      productName: issuedItem.productName,
      category: product ? product.category : "N/A",
      action: "Returned",
      details: `Item returned by ${issuedItem.studentName}. Stock restored.`,
      performedBy: req.user.email,
    });

    return res.status(200).json({ 
      status: true, 
      message: "Item returned successfully and inventory stock restored" 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Failed to process return", error });
  }
};