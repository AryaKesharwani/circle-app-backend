const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoice_name: { type: String, required: true },
  invoice_description: { type: String },
  amount: { type: Number, required: true },
  payee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the payee user
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the payer user
  wallet_address: {
    address: { type: String, required: true },
    chain_number: { type: Number, required: true },
    chain_name: { type: String, required: true },
  },
  status: { type: String, required: true, default: 'pending' }, // pending, processing, paid
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }, // Reference to the transaction
});

module.exports = mongoose.model('Invoice', invoiceSchema);
