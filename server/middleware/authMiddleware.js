// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
let token;

if (
    req.headers.authorization && 
    req.headers.authorization.startsWith("Bearer")) {
try {
    token = req.headers.authorization.split(" ")[1];
    console.log("🧠 Token received:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded user ID:", decoded.id);

    req.user = await User.findById(decoded.id).select("-password");
    next();
} catch (err) {
    console.error("❌ JWT Verification failed:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
    }
} else {
    console.log("🚫 No token received in headers");
    res.status(401).json({ message: "Not authorized, no token" });
}
};

