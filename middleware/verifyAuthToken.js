require("dotenv").config();
const jwt = require('jsonwebtoken'); 
const User = require('../models/user');

const verifyAuthToken = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1]; // Extract token from authorization header
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token.replace(/['"]+/g, ""), process.env.JWT_SECRET); // Verify token using secret key
    req.user = await User.findById(decoded._id); // Make user information available in the request object
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};


module.exports = verifyAuthToken;