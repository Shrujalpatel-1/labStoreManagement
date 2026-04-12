import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";
import bcrypt from "bcrypt";

export const registerController = async (req, res) => {
  try {
    // 1. Allow 'role' to be passed during registration (optional)
    const { email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Changed 404 to 409 (Conflict) which is more accurate for duplicates
      return res
        .status(409)
        .json({ status: false, message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user (Pass role if provided, otherwise model defaults to 'faculty')
    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || "faculty",
    });

    await newUser.save();

    res
      .status(200)
      .json({ status: true, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email.toLowerCase().endsWith("@mnnit.ac.in")) {
      return res.status(403).json({ 
        status: false, 
        message: "Access Denied: Organization email (@mnnit.ac.in) is strictly required." 
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "Invalid email or password" });
    }

    // Compare the passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(404)
        .json({ status: false, message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    let options = {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.cookie("token", token, options);

    // --- FIX IS HERE: SEND THE USER DATA ---
    res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        _id: user._id,
        email: user.email,
        role: user.role, // <--- This fixes the frontend error!
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

export const logoutController = (req, res) => {
  // Pass the same options so the browser knows which cookie to clear
  res.clearCookie("token", { secure: true, sameSite: "None" });
  res.status(200).json({ status: true, message: "Logged out successfully" });
};

export const getUserController = async (req, res) => {
  try {
    // get user
    const user = await User.findOne({ _id: req.user.userId });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, msessage: "unauthorized user", error });
    }

    const { email, products, sales } = user;
    return res
      .status(200)
      .json({ status: true, data: { email, products, sales } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// 1. GET SETUP STATUS (Public)
export const getSetupStatus = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).json({ status: true, isSetup: userCount > 0 });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// 2. INITIAL SETUP REGISTRATION (Public, only works if DB is empty)
export const setupInitialUserController = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(403).json({ status: false, message: "System is already initialized." });
    }

    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // First user is ALWAYS a lab_coordinator
    const newUser = new User({ email, password: hashedPassword, role: "lab_coordinator" });
    await newUser.save();

    res.status(200).json({ status: true, message: "Initial Lab Coordinator created successfully." });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Extract the exact validation message from Mongoose
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ status: false, message: messages.join(", ") });
    }
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// 3. SECURE ADD USER (Protected, lab_coordinator only)
export const addUserController = async (req, res) => {
  try {
    // RBAC Check: Ensure requester is lab_coordinator
    if (req.user.role !== "lab_coordinator") {
      return res.status(403).json({ status: false, message: "Only Lab Coordinators can add users." });
    }

    const { email, password, role } = req.body;

    // --- ENFORCE LIMITS ---
    if (role === "storekeeper") {
      const storekeeperCount = await User.countDocuments({ role: "storekeeper" });
      if (storekeeperCount >= 1) return res.status(400).json({ status: false, message: "Limit reached: Only 1 Storekeeper allowed." });
    } else if (role === "lab_coordinator") {
      const coordCount = await User.countDocuments({ role: "lab_coordinator" });
      if (coordCount >= 5) return res.status(400).json({ status: false, message: "Limit reached: Maximum 5 Lab Coordinators allowed." });
    } else {
       return res.status(400).json({ status: false, message: "Invalid role." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ status: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    res.status(200).json({ status: true, message: `${role} added successfully.` });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ status: false, message: messages.join(", ") });
    }
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// 4. GET ALL USERS (Protected, lab_coordinator only)
export const getAllUsersController = async (req, res) => {
  if (req.user.role !== "lab_coordinator") return res.status(403).json({ status: false, message: "Forbidden" });
  const users = await User.find({}, { password: 0 }); // Exclude passwords
  res.status(200).json({ status: true, data: users });
};

// 5. DELETE USER (Protected, lab_coordinator only)
export const deleteUserController = async (req, res) => {
  if (req.user.role !== "lab_coordinator") return res.status(403).json({ status: false, message: "Forbidden" });
  
  const { userId } = req.body;
  if (req.user.userId === userId) return res.status(400).json({ status: false, message: "You cannot delete yourself." });

  await User.findByIdAndDelete(userId);
  res.status(200).json({ status: true, message: "User removed successfully." });
};