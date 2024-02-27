const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = require('../models/user');

const isPayerMiddleware=async (req, res, next)=> {
  try {
    // Extract token from the request (replace with your token extraction logic)
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized (missing token)' });
    }

    // Verify token (replace with your actual token verification logic)
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    req.user = await User.findById(decoded._id);

    // Check if user is a payer based on the decoded token data
    // if (!decoded.isPayer) {
    //   return res.status(403).json({ error: 'Forbidden (not a payer)' });
    // }

    console.log(user.role)
    if(req.user.role=='payer'){
      return res.status(403).json({ error: 'Forbidden (not a payer)' });
    }

    // User is a payer, proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle potential errors during token verification or other issues
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = isPayerMiddleware;