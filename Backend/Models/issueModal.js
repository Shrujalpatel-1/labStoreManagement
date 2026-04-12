import mongoose from "mongoose";

// This is the updated schema for tracking issued items
const issuedItemSchema = new mongoose.Schema(
  {
    // serialNo field has been removed.
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: 'true',
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // Quantity must be at least 1
    },
    studentName: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now, // Automatically set to the time of creation
    },
    // Stores true or false
    isReturnable: {
      type: Boolean,
      required: true,
    },
    // This date will remain null unless it is a returnable item
    // and the item has been returned.
    returnDate: {
      type: Date,
      default: null, // Set to null initially
    },
    isReturned: {
      type: Boolean,
      default: false,
    },
    actualReturnDate: {
      type: Date,
      default: null,
    },
  },
  {
    // Adds createdAt and updatedAt timestamps automatically
    timestamps: true,
  }
);

const IssuedItem = mongoose.model("IssuedItem", issuedItemSchema);

export default IssuedItem;
