const express = require("express");
const router = express.Router();

// models
const User = require("./models/user");

// middleware
const onlyPayer = require("../middleware/onlyPayer");


// Register a new user
router.post("/users", async (req, res) => {
  const { email, password, isPayer, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = new User({ email, password, isPayer, role });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// create a payer
router.post("/create-payer", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const payerUser = new User({
      email,
      password,
      isPayer: true,
      role: "payer",
    });
    const savedUser = await payerUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// create a payee
router.post("/create-payee", onlyPayer ,async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // randomly create the password for the payee
    const password = "payee123";
    const payeeUser = new User({
      email,
      password,
      isPayer: false,
      role: "payee",
      payer: req.user._id,
    });
    const savedUser = await payeeUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login a user and return JWT token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = await user.generateAuthToken();
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
