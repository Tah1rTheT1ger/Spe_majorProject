const assert = require('assert');
const patientController = require('../controllers/patientController');
const patientRoutes = require('../routes/patientRoutes');

console.log('Running Patient Service Tests...');

// Test 1: Controller functions exist
try {
    assert.strictEqual(typeof patientController.createPatient, 'function', 'createPatient should be a function');
    assert.strictEqual(typeof patientController.getPatientById, 'function', 'getPatientById should be a function');
    assert.strictEqual(typeof patientController.searchPatients, 'function', 'searchPatients should be a function');
    assert.strictEqual(typeof patientController.updatePatient, 'function', 'updatePatient should be a function');
    assert.strictEqual(typeof patientController.deletePatient, 'function', 'deletePatient should be a function');
    console.log('✅ Controller Structure Verification Passed');
} catch (e) {
    console.error('❌ Controller Structure Verification Failed');
    console.error(e);
    process.exit(1);
}

// Test 2: Routes are exported
try {
    assert.strictEqual(typeof patientRoutes, 'function', 'Router should be a function/object');
    console.log('✅ Router Export Verification Passed');
} catch (e) {
    console.error('❌ Router Export Verification Failed');
    console.error(e);
    process.exit(1);
}

console.log('Patient Service Tests Completed Successfully');
