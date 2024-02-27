const express = require('express')
const router = express.Router()

const Invoice = require("../models/invoice");
const verifyAuthToken = require("../middleware/verifyAuthToken");

// Get all invoices
router.get("/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific invoice by ID
router.get("/invoices/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new invoice
router.post("/invoices", verifyAuthToken, async (req, res) => {
  const { invoice_name, invoice_description, amount, payerEmail } = req.body;
  const payeeId = req.user._id; // Get ID of the logged-in user (payee)

  try {
    // Validate user role (payee)
    if (req.user.isPayer) {
      return res.status(403).json({ message: "Payers cannot create invoices" });
    }

    const payer = await User.findOne({ email: payerEmail });

    if (!payer) {
      return res.status(400).json({ message: "Payer user not found" });
    }

    const invoice = new Invoice({
      invoice_name,
      invoice_description,
      amount,
      payee: payeeId,
      payer: payer._id,
      wallet_address: req.body.wallet_address, // Assuming wallet details are also provided
    });

    const savedInvoice = await invoice.save();
    res.status(201).json(savedInvoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an existing invoice
router.put("/invoices/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(updatedInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an invoice
router.delete("/invoices/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json({ message: "Invoice deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router