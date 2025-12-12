const assert = require('assert');
const prescriptionController = require('../controllers/prescriptionController');
const prescriptionRoutes = require('../routes/prescriptionRoutes');

console.log('Running Prescription Service Tests...');

// Test 1: Controller functions exist
try {
    assert.strictEqual(typeof prescriptionController.createPrescription, 'function', 'createPrescription should be a function');
    assert.strictEqual(typeof prescriptionController.getPrescription, 'function', 'getPrescription should be a function');
    assert.strictEqual(typeof prescriptionController.listPrescriptions, 'function', 'listPrescriptions should be a function');
    assert.strictEqual(typeof prescriptionController.updatePrescription, 'function', 'updatePrescription should be a function');
    assert.strictEqual(typeof prescriptionController.issuePrescription, 'function', 'issuePrescription should be a function');
    assert.strictEqual(typeof prescriptionController.deletePrescription, 'function', 'deletePrescription should be a function');
    console.log('✅ Controller Structure Verification Passed');
} catch (e) {
    console.error('❌ Controller Structure Verification Failed');
    console.error(e);
    process.exit(1);
}

// Test 2: Routes are exported
try {
    assert.strictEqual(typeof prescriptionRoutes, 'function', 'Router should be a function/object');
    console.log('✅ Router Export Verification Passed');
} catch (e) {
    console.error('❌ Router Export Verification Failed');
    console.error(e);
    process.exit(1);
}

console.log('Prescription Service Tests Completed Successfully');
