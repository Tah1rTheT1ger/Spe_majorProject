const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: String,
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dob: Date,
  gender: { type: String, enum: ['male','female','other'] },
  contact: {
    phone: String,
    email: String,
    address: String
  },
  insurance: {
    provider: String,
    policyNumber: String
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // optional reference to Auth user
});

module.exports = mongoose.model('Patient', PatientSchema);
