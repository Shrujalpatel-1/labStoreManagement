import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";
import bcrypt from "bcrypt";

// export const registerController = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(404).json({ status:false,message: 'User already exists' });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create a new user
//         const newUser = new User({ email, password: hashedPassword });
//         await newUser.save();

//         res.status(200).json({ status:true,message: 'User registered successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ status:false,message: 'Server error' });
//     }
// };

// export const loginController = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Find the user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ status:false,message: 'Invalid email or password 1' });
//         }

//         // Compare the passwords
//         const isPasswordMatch = await bcrypt.compare(password, user.password);
//         if (!isPasswordMatch) {
//             return res.status(404).json({ status:false,message: 'Invalid email or password 2' });
//         }

//         // Generate a JWT token
//         const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

//      let options = {
//            maxAge: 1000 * 60 * 60 * 24, // 1 day (in milliseconds)
//             httpOnly: true, // <-- SET TO TRUE for security
//             secure: true,   // <-- ADD THIS (for HTTPS)
//             sameSite: 'None'  // <-- ADD THIS (for cross-domain)
//         }
//
//         res.cookie('token', token, options); // <--- PASS OPTIONS HERE
//         res.status(200).json({ status:true,message: 'Login successful' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ status:false,message: 'Server error' });
//     }
// };
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
// export const logoutController = (req, res) => {
//     res.clearCookie('token');
//     res.status(200).json({ status:true,message: 'Logged out successfully' });
// };
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
