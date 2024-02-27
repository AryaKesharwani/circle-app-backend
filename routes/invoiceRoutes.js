const express = require('express')
const router = express.Router()

const Invoice = require("../models/invoice");
const Transaction = require("../models/transaction");
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
      status: "pending",
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


// payer can only pay the invoice (creates a transaction and update the invoice transaction field with the saved transaction ID)
router.put("/invoices/:id/pay", verifyAuthToken, async (req, res) => {
    const invoiceId = req.params.id;
    const payerId = req.user._id; // Get ID of the logged-in user (payer)
    try{
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        if (invoice.status === "paid") {
            return res.status(400).json({ message: "Invoice already paid" });
        }

        // checking if the payer is the one who is supposed to pay the invoice
        if (invoice.payer.toString() !== payerId) 
            return res.status(403).json({ message: "Unauthorized" });

        const transaction = new Transaction(req.body);
        const savedTransaction = await transaction.save();

        // Update the invoice transaction field with the saved transaction ID
        invoice.transaction = savedTransaction._id;

        // Save the updated invoice
        await invoice.save();

        return res.status(200).json({ message: "transaction added to the invoice" });

    }catch(err){
        res.status(400).json({ message: err.message });
    }
});

// Get all invoices for a user
router.get('show-invoice', verifyAuthToken, async (req, res) => {
    const userId = req.user._id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if(user.isPayer){
            const invoices = await Invoice.find({payer: userId}); // Filter invoices based on payer ID
            res.json(invoices);
        }else{
            const invoices = await Invoice.find({payee: userId});
            res.json(invoices);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});  

router.put('/invoices/:id/paid', verifyAuthToken, async (req, res) => {

    const invoiceId = req.params.id;
    try{
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        if (invoice.status === "paid") {
            return res.status(400).json({ message: "Invoice already paid" });
        }

        // checking if the payer is the one who is supposed to pay the invoice
        if (invoice.payer.toString() !== req.user._id) 
            return res.status(403).json({ message: "Unauthorized" });

        
        // Update the invoice status to "paid"
        invoice.status = "paid";

        // Save the updated invoice
        await invoice.save();
        return res.status(200).json({ message: "invoice updated as paid" });

    }catch(err){
        res.status(400).json({ message: err.message });
    }

});


module.exports = router;