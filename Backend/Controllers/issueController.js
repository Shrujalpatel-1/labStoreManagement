import IssuedItem from "../Models/issueModal.js";
import Product from "../Models/productModal.js";

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
    } = req.body;

    const numQuantity = Number(quantity);

    // 1. ATOMIC UPDATE: Find the product ONLY if it has enough stock, and decrement it.
    // This prevents race conditions and over-issuing.
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, quantityAvailable: { $gte: numQuantity } },
      { $inc: { quantityAvailable: -numQuantity } },
      { new: true } 
    );

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
      quantity: numQuantity,
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
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: issuedItem.productId },
      { $inc: { quantityAvailable: issuedItem.quantity } },
      { new: true }
    );

    // If product was deleted from DB in the meantime, we still allow marking the issue as returned
    if (!updatedProduct) {
      console.warn(`Product ID ${issuedItem.productId} not found. Marking issue as returned anyway.`);
    }

    // 3. Mark the issue as returned
    issuedItem.isReturned = true;
    issuedItem.actualReturnDate = new Date();
    await issuedItem.save();

    return res.status(200).json({ 
      status: true, 
      message: "Item returned successfully and inventory stock restored" 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Failed to process return", error });
  }
};