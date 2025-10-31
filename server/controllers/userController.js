// controllers/userController.js
const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // ❌ Remove manual hashing — let the model handle it
    const user = await User.create({
      name,
      email,
      password, // plain password, model will hash it
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error registering user",
      error: err.message,
    });
  }
};


// ✅ Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("DEBUG: entered password =", password);
    console.log("DEBUG: bcrypt comparison result =", isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }


    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    });
    console.log("🧠 Incoming login request:", req.body);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ Get current logged-in user
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching profile",
      error: err.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};