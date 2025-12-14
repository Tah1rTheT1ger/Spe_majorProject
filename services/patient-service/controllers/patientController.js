const Patient = require('../models/Patient');
const axios = require('axios');
const bcrypt = require('bcryptjs');

exports.createPatient = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      username, 
      password, 
      dob, 
      gender, 
      contact, 
      insurance 
    } = req.body;

    // --- FIX START: Prepare required fields for auth-service ---
    const fullName = `${firstName} ${lastName}`;
    
    // We assume contact.email exists based on typical contact schema design.
    // If your contact schema uses a different path, adjust contact.email below.
    const emailAddress = contact ? contact.email : `${username}@placeholder.com`; 
    // You might want a better way to ensure a valid email is passed if required
    // by the auth-service schema.

    // Create user in auth-service
    // The request now includes 'name' and 'email' which are required by the User schema in auth-service.
    const authResponse = await axios.post('http://auth-service:4000/api/auth/register', {
      username: username,
      password: password,
      role: 'patient',
      name: fullName, // <-- ADDED: Constructed from firstName and lastName
      email: emailAddress // <-- ADDED: Extracted from contact object
    });
    // --- FIX END ---

    const userId = authResponse.data.user.id;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const patient = new Patient({
      firstName,
      lastName,
      username,
      // Note: We hash the password before saving to the patient collection as well
      // The auth-service also hashes it internally.
      password: hashedPassword, 
      userId,
      dob,
      gender,
      contact,
      insurance
    });

    if (req.user && req.user.id) {
      patient.createdBy = req.user.id;
    }

    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    console.error(err);
    // Include more detail in the 500 response for debugging,
    // though in production you'd keep it generic.
    res.status(500).json({ 
      message: 'Server error during patient creation or auth registration.',
      detail: err.message // Providing the internal error message for context
    });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const p = await Patient.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchPatients = async (req, res) => {
  try {
    const q = req.query.q || '';
    const patients = await Patient.find({
      $or: [
        { firstName: new RegExp(q, 'i') },
        { lastName: new RegExp(q, 'i') },
        { 'contact.phone': new RegExp(q, 'i') },
        { 'contact.email': new RegExp(q, 'i') }
      ]
    }).limit(50);
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPatientByUserId = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.params.userId });
    if (!patient) return res.status(404).json({ message: 'Not found' });
    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};