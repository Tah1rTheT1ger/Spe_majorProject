const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');

/**
 * hasConflict(patientId, doctorId, scheduledAt, durationMinutes)
 * returns a Promise resolving to true if an overlapping appointment exists
 */
async function hasConflict(patientId, doctorId, scheduledAt, durationMinutes) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + Number(durationMinutes) * 60000);

  const pId = mongoose.Types.ObjectId.isValid(patientId) ? new mongoose.Types.ObjectId(patientId) : null;
  const dId = mongoose.Types.ObjectId.isValid(doctorId) ? new mongoose.Types.ObjectId(doctorId) : null;

  const participantFilter = { $or: [] };
  if (dId) participantFilter.$or.push({ doctorId: dId });
  if (pId) participantFilter.$or.push({ patientId: pId });
  if (participantFilter.$or.length === 0) return false;

  const overlapQuery = {
    ...participantFilter,
    $and: [
      { scheduledAt: { $lt: end } },
      {
        $expr: {
          $gt: [
            { $add: ["$scheduledAt", { $multiply: ["$durationMinutes", 60000] }] },
            start
          ]
        }
      }
    ]
  };

  const found = await Appointment.findOne(overlapQuery).lean();
  return !!found;
}

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, scheduledAt, durationMinutes = 30, reason } = req.body;

    // RBAC: Patients cannot create appointments
    if (req.user.role === 'patient') {
      return res.status(403).json({ message: 'Patients cannot create appointments' });
    }

    if (!patientId || !doctorId || !scheduledAt) {
      return res.status(400).json({ message: 'patientId, doctorId and scheduledAt are required' });
    }

    const conflict = await hasConflict(patientId, doctorId, scheduledAt, durationMinutes);
    if (conflict) return res.status(409).json({ message: 'Appointment conflict' });

    const appt = new Appointment({
      patientId: new mongoose.Types.ObjectId(patientId),
      doctorId: new mongoose.Types.ObjectId(doctorId),
      scheduledAt: new Date(scheduledAt),
      durationMinutes,
      reason,
      status: 'scheduled',
      createdBy: req.user && req.user.id
    });

    await appt.save();
    res.status(201).json(appt);
  } catch (err) {
    console.error('createAppointment err', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listAppointments = async (req, res) => {
  try {
    const q = {};
    // RBAC: Patients can only see their own appointments
    if (req.user.role === 'patient') {
      q.patientId = new mongoose.Types.ObjectId(req.user.id);
    }
    if (req.query.doctorId && mongoose.Types.ObjectId.isValid(req.query.doctorId)) q.doctorId = new mongoose.Types.ObjectId(req.query.doctorId);
    if (req.query.patientId && mongoose.Types.ObjectId.isValid(req.query.patientId)) q.patientId = new mongoose.Types.ObjectId(req.query.patientId);
    if (req.query.date) {
      const day = new Date(req.query.date);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      q.scheduledAt = { $gte: day, $lt: next };
    }
    const items = await Appointment.find(q).sort({ scheduledAt: 1 }).limit(500);
    res.json(items);
  } catch (err) {
    console.error('listAppointments err', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: 'Not found' });
    res.json(appt);
  } catch (err) {
    console.error('getAppointment err', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    const update = req.body;
    if ((update.scheduledAt || update.durationMinutes)) {
      const appt = await Appointment.findById(id);
      if (!appt) return res.status(404).json({ message: 'Not found' });
      const start = update.scheduledAt ? new Date(update.scheduledAt) : appt.scheduledAt;
      const duration = update.durationMinutes !== undefined ? update.durationMinutes : appt.durationMinutes;
      const end = new Date(start.getTime() + Number(duration) * 60000);

      const participantFilter = {
        $or: [{ doctorId: appt.doctorId }, { patientId: appt.patientId }],
        _id: { $ne: appt._id }
      };

      const overlapQuery = {
        ...participantFilter,
        $and: [
          { scheduledAt: { $lt: end } },
          {
            $expr: {
              $gt: [
                { $add: ["$scheduledAt", { $multiply: ["$durationMinutes", 60000] }] },
                start
              ]
            }
          }
        ]
      };

      const found = await Appointment.findOne(overlapQuery).lean();
      if (found) return res.status(409).json({ message: 'Appointment conflict' });
    }

    const updated = await Appointment.findByIdAndUpdate(id, update, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('updateAppointment err', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    await Appointment.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteAppointment err', err);
    res.status(500).json({ message: 'Server error' });
  }
};