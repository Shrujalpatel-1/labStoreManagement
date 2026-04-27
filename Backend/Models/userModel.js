import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Regex strictly demands EXACTLY @mnnit.ac.in at the end. No subdomains.
        return /^[a-zA-Z0-9._%+-]+@mnnit\.ac\.in$/.test(v);
      },
      message: props => `${props.value} is an invalid domain. Only @mnnit.ac.in is allowed.`
    },
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  role: {
    type: String,
    enum: ["hod", "lab_oc", "storekeeper"], // Keep old for migration
    default: "lab_oc",
  },
});

const User = mongoose.model("User", userSchema);

export default User;
