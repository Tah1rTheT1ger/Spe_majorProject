const Patient = require('../models/Patient');
const axios = require('axios');
const bcrypt = require('bcryptjs');

exports.createPatient = async (req, res) => {
  try {
    const { firstName, lastName, username, password, dob, gender, contact, insurance } = req.body;

    // Create user in auth-service
    const authResponse = await axios.post('http://auth-service:4000/api/auth/register', {
      username,
      password,
      role: 'patient'
    });

    const userId = authResponse.data.user.id;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const patient = new Patient({
      firstName,
      lastName,
      username,
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
    res.status(500).json({ message: 'Server error' });
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
