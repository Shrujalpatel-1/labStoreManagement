import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false, // Some logs might be general
    },
    productName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ["Added", "Updated", "Issued", "Returned", "Deleted"],
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    performedBy: {
      type: String, // Email or Name of the user
      required: true,
    },
  },
  { timestamps: true }
);

const Log = mongoose.model("Log", logSchema);
export default Log;
