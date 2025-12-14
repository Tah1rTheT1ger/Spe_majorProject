const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/patientController');
const { verifyToken } = require('../middlewares/auth');

router.post('/', verifyToken, ctrl.createPatient);
router.get('/search', verifyToken, ctrl.searchPatients);
router.get('/:id', verifyToken, ctrl.getPatientById);
router.put('/:id', verifyToken, ctrl.updatePatient);
router.delete('/:id', verifyToken, ctrl.deletePatient);
router.get('/user/:userId', verifyToken, ctrl.getPatientByUserId);

module.exports = router;
