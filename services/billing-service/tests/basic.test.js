const assert = require('assert');
const billingController = require('../controllers/billingController');
const billingRoutes = require('../routes/billingRoutes');

console.log('Running Billing Service Tests...');

// Test 1: Controller functions exist
try {
    assert.strictEqual(typeof billingController.createBill, 'function', 'createBill should be a function');
    assert.strictEqual(typeof billingController.getBill, 'function', 'getBill should be a function');
    assert.strictEqual(typeof billingController.listBills, 'function', 'listBills should be a function');
    assert.strictEqual(typeof billingController.addItem, 'function', 'addItem should be a function');
    assert.strictEqual(typeof billingController.payBill, 'function', 'payBill should be a function');
    assert.strictEqual(typeof billingController.cancelBill, 'function', 'cancelBill should be a function');
    console.log('✅ Controller Structure Verification Passed');
} catch (e) {
    console.error('❌ Controller Structure Verification Failed');
    console.error(e);
    process.exit(1);
}

// Test 2: Routes are exported
try {
    assert.strictEqual(typeof billingRoutes, 'function', 'Router should be a function/object');
    console.log('✅ Router Export Verification Passed');
} catch (e) {
    console.error('❌ Router Export Verification Failed');
    console.error(e);
    process.exit(1);
}

console.log('Billing Service Tests Completed Successfully');
