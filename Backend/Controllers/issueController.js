import IssuedItem from "../Models/issueModal.js";

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
      productName,
      quantity,
      studentName,
      registrationNumber,
      course,
      isReturnable,
      issueDate,
      expectedReturnDate,
    } = req.body;

    // Build the data object for the new item
    const newItemData = {
      productName,
      quantity,
      studentName,
      registrationNumber,
      course,
      isReturnable,
    };

    // Only add dates if they were provided in the request
    // If not, the model's 'default' values will be used
    if (issueDate) {
      newItemData.issueDate = issueDate;
    }

    // Only add the expected return date if the item is returnable
    // and a date was provided
    if (isReturnable && expectedReturnDate) {
      // Use the 'returnDate' field as defined in your Mongoose schema
      newItemData.returnDate = expectedReturnDate;
    }

    // Create the document.
    // Your model's 'pre-save' hook will automatically assign the
    // auto-incrementing 'issueId' (1, 2, 3...)
    const issuedItem = await IssuedItem.create(newItemData);

    return res.status(200).json({
      status: true,
      message: "Item issued successfully", // Updated message
      data: issuedItem, // Send back the new item
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
