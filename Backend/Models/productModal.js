import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      "chemical",
      "plasticware",
      "glassware",
      "teaching_kit",
      "miscellaneous",
    ],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  storageTemp: {
    type: String, // e.g., "2-8°C" or "Room Temperature"
  },
  quantityOrdered: {
    type: String,
    //required: true,
  },
  quantityAvailable: {
    type: String,
    //required: true,
  },
  brand: {
    type: String,
  },
  lotNo: {
    type: String,
  },
  dateOfPurchase: {
    type: Date,
    //required: true,
  },
  dateOfExpiry: {
    type: Date, // only for chemicals
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
