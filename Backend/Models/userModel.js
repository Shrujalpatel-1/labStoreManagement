import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  role: {
    type: String,
    enum: ["lab_coordinator", "storekeeper"],
    default: "lab_coordinator",
  },
});

const User = mongoose.model("User", userSchema);

export default User;
