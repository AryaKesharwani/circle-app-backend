const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();
const db = require("./config");


// middleware
const verifyAuthToken = require("./middleware/verifyAuthToken");

const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
app.use(bodyParser.json());

const userRoutes = require("./routes/userRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

app.use(userRoutes);
app.use(invoiceRoutes);

app.post("/invoices", verifyAuthToken, async (req, res) => {
  const { invoice_name, invoice_description, amount, payerId } = req.body;
  const userId = req.user.id; // Replace with your logic to get logged-in user ID

  try {
    const payee = await User.findById(userId);
    const payer = await User.findById(payerId);

    if (!payee || !payer) {
      return res.status(404).json({ message: "User not found" });
    }

    const invoice = new Invoice({
      invoice_name,
      invoice_description,
      amount,
      payee,
      payer,
      wallet_address: req.body.wallet_address, // Assuming wallet details are also provided
    });

    const savedInvoice = await invoice.save();
    res.status(201).json(savedInvoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



app.listen(port, () => console.log(`Server listening on port ${port}`));
