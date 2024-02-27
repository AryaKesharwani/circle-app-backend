const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    source: { type: String, required: true },
    target: { type: String, required: true },
    address: { type: String, required: true },
    amount: { type: Number, required: true },
    hash: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, required: true },
    messageBytes: { type: String, required: true },
    messageHash: { type: String, required: true },
    signature: { type: String, required: true }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;



