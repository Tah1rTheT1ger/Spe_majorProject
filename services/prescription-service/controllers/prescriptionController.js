const Prescription = require('../models/Prescription');
//hbjdfasjhgbadsjhbd
/**
 * Create prescription (doctor required)
 * body: { patientId, items, notes }
 */
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, items = [], notes } = req.body;
    if (!patientId || !items.length) return res.status(400).json({ message: 'patientId and items required' });

    const pres = new Prescription({
      patientId,
      doctorId: req.user?.id,
      items,
      notes,
      createdBy: req.user?.id
    });
    await pres.save();
    res.status(201).json(pres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPrescription = async (req, res) => {
  try {
    const pres = await Prescription.findById(req.params.id);
    if (!pres) return res.status(404).json({ message: 'Not found' });
    res.json(pres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listPrescriptions = async (req, res) => {
  try {
    const { patientId, doctorId, from, to } = req.query;
    const q = {};
    if (patientId) q.patientId = patientId;
    if (doctorId) q.doctorId = doctorId;
    if (from || to) {
      q.date = {};
      if (from) q.date.$gte = new Date(from);
      if (to) q.date.$lte = new Date(to);
    }
    const list = await Prescription.find(q).sort({ date: -1 }).limit(500);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePrescription = async (req, res) => {
  try {
    const updated = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.issuePrescription = async (req, res) => {
  try {
    const pres = await Prescription.findById(req.params.id);
    if (!pres) return res.status(404).json({ message: 'Not found' });
    pres.issued = true;
    await pres.save();
    res.json(pres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePrescription = async (req, res) => {
  try {
    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
