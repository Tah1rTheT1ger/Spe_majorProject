const path = require('path');
const fs = require('fs');
const ScanMeta = require('../models/ScanMeta');
const axios = require('axios');

// POST /api/scans
// multipart/form-data: file, patientId, type, description
exports.uploadScan = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { patientId, type, description } = req.body;
    if (!patientId) return res.status(400).json({ message: 'patientId is required' });

    const file = req.file;

    const meta = new ScanMeta({
      patientId,
      uploadedBy: req.user.id,
      type,
      description,
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      storagePath: file.path
    });

    await meta.save();
    res.status(201).json(meta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/scans/patient/:patientId
exports.getScansByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { user } = req;

    if (user.role === 'patient') {
      // Patient can only see their own scans
      const response = await axios.get(`http://patient-service:5002/api/patients/user/${user.id}`, {
        headers: {
          'Authorization': req.headers.authorization
        }
      });
      const patient = response.data;

      if (patient._id.toString() !== patientId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const scans = await ScanMeta.find({ patientId }).sort({ createdAt: -1 });
    res.json(scans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/scans/:id
exports.getScanMeta = async (req, res) => {
  try {
    const scan = await ScanMeta.findById(req.params.id);
    if (!scan) return res.status(404).json({ message: 'Scan not found' });
    res.json(scan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/scans/:id/stream
exports.streamScan = async (req, res) => {
  try {
    const scan = await ScanMeta.findById(req.params.id);
    if (!scan) return res.status(404).json({ message: 'Scan not found' });

    const filePath = path.resolve(scan.storagePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File missing on server' });
    }

    res.setHeader('Content-Type', scan.mimeType);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// GET /api/scans/:id/download
exports.downloadScan = async (req, res) => {
  try {
    const scan = await ScanMeta.findById(req.params.id);
    if (!scan) return res.status(404).json({ message: 'Scan not found' });

    const filePath = path.resolve(scan.storagePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File missing on server' });
    }

    res.download(filePath, scan.originalName);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// DELETE /api/scans/:id
exports.deleteScan = async (req, res) => {
  try {
    const scan = await ScanMeta.findById(req.params.id);
    if (!scan) return res.status(404).json({ message: 'Scan not found' });

    // Optional: only admin/doctor can delete
    // if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }

    const filePath = path.resolve(scan.storagePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await scan.deleteOne();
    res.json({ message: 'Scan deleted' });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};
