require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

// schema where the user be a payer or payee also the payer can only create the payee


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isPayer: { type: Boolean, required: true }, // true for payer, false for payee
  role: { type: String, enum: ['payer', 'payee'], required: true, default: 'payer' }, // Explicitly define roles
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the payer user
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Hash password before saving
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.generateAuthToken = async function () {
  const token = await jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Replace with your secret key and expiry time
  return token;
};

module.exports = mongoose.model('User', userSchema);