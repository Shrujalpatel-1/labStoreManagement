import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";
import bcrypt from "bcrypt";

export const registerController = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email.toLowerCase().endsWith("@mnnit.ac.in")) {
      return res.status(403).json({ 
        status: false, 
        message: "Access Denied: Organization email (@mnnit.ac.in) is strictly required." 
      });
    }

    const totalUsers = await User.countDocuments();

    // 1. First user logic: must be hod or lab_oc
    if (totalUsers === 0) {
      if (role !== "hod" && role !== "lab_oc") {
        return res.status(400).json({ 
          status: false, 
          message: "The first user must be either HOD or Lab OC." 
        });
      }
    } else {
      // 2. Limit administrative roles
      if (role !== "faculty") {
        const adminUsers = await User.countDocuments({ role: { $ne: "faculty" } });
        if (adminUsers >= 3) {
          return res.status(400).json({ 
            status: false, 
            message: "Maximum limit reached for administrative accounts (1 HOD, 1 Lab OC, 1 Storekeeper)." 
          });
        }

        const existingRole = await User.findOne({ role });
        if (existingRole) {
          const roleMap = {
            hod: "HOD",
            lab_oc: "Lab OC",
            storekeeper: "Storekeeper"
          };
          return res.status(400).json({ 
            status: false, 
            message: `A ${roleMap[role] || role} already exists. Only one account per administrative role is allowed.` 
          });
        }
      }
    }

    // Check if user already exists with same email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ status: false, message: "User already exists with this email." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(200).json({ 
      status: true, 
      message: totalUsers === 0 ? "System initialized successfully." : "User registered successfully." 
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ status: false, message: "Server error during registration" });
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
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
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

    const { email, role, products, sales } = user;
    return res
      .status(200)
      .json({ status: true, data: { email, role, products, sales } });
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

// 3. SECURE ADD USER (Protected)
export const addUserController = async (req, res) => {
  try {
    // RBAC Check: Ensure requester is hod or lab_oc
    if (req.user.role !== "hod" && req.user.role !== "lab_oc") {
      return res.status(403).json({ status: false, message: "Only HOD or Lab OC can add users." });
    }

    const { email, password, role } = req.body;

    // --- ENFORCE LIMITS FOR ADMINISTRATIVE ROLES ---
    if (role !== "faculty") {
      const adminUsers = await User.countDocuments({ role: { $ne: "faculty" } });
      if (adminUsers >= 3) {
        return res.status(400).json({ 
          status: false, 
          message: "Maximum limit reached for administrative accounts (1 HOD, 1 Lab OC, 1 Storekeeper)." 
        });
      }

      const countForRole = await User.countDocuments({ role });
      if (countForRole >= 1) {
        const roleMap = {
          hod: "HOD",
          lab_oc: "Lab OC",
          storekeeper: "Storekeeper"
        };
        return res.status(400).json({ status: false, message: `A ${roleMap[role]} already exists.` });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ status: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    res.status(200).json({ status: true, message: `${roleMap[role]} added successfully.` });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ status: false, message: messages.join(", ") });
    }
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// 4. GET ALL USERS (Protected)
export const getAllUsersController = async (req, res) => {
  if (req.user.role !== "hod" && req.user.role !== "lab_oc") {
    return res.status(403).json({ status: false, message: "Forbidden" });
  }
  const users = await User.find({}, { password: 0 }); // Exclude passwords
  res.status(200).json({ status: true, data: users });
};

// 5. DELETE USER (Protected)
export const deleteUserController = async (req, res) => {
  if (req.user.role !== "hod" && req.user.role !== "lab_oc") {
    return res.status(403).json({ status: false, message: "Forbidden" });
  }
  
  const { userId } = req.body;
  if (req.user.userId === userId) return res.status(400).json({ status: false, message: "You cannot delete yourself." });

  await User.findByIdAndDelete(userId);
  res.status(200).json({ status: true, message: "User removed successfully." });
};