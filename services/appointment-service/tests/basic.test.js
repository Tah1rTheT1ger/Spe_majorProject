const assert = require('assert');
const appointmentController = require('../controllers/appointmentController');
const appointmentRoutes = require('../routes/appointmentRoutes');

console.log('Running Appointment Service Tests...');

// Test 1: Controller functions exist
try {
    assert.strictEqual(typeof appointmentController.createAppointment, 'function', 'createAppointment should be a function');
    assert.strictEqual(typeof appointmentController.listAppointments, 'function', 'listAppointments should be a function');
    assert.strictEqual(typeof appointmentController.getAppointment, 'function', 'getAppointment should be a function');
    assert.strictEqual(typeof appointmentController.updateAppointment, 'function', 'updateAppointment should be a function');
    assert.strictEqual(typeof appointmentController.deleteAppointment, 'function', 'deleteAppointment should be a function');
    console.log('✅ Controller Structure Verification Passed');
} catch (e) {
    console.error('❌ Controller Structure Verification Failed');
    console.error(e);
    process.exit(1);
}

// Test 2: Routes are exported
try {
    assert.strictEqual(typeof appointmentRoutes, 'function', 'Router should be a function/object');
    console.log('✅ Router Export Verification Passed');
} catch (e) {
    console.error('❌ Router Export Verification Failed');
    console.error(e);
    process.exit(1);
}

console.log('Appointment Service Tests Completed Successfully');
