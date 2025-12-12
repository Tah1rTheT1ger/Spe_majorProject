const assert = require('assert');
const scanController = require('../controllers/scanController');
const scanRoutes = require('../routes/scanRoutes');

console.log('Running Scans Service Tests...');

// Test 1: Controller functions exist
try {
    assert.strictEqual(typeof scanController.uploadScan, 'function', 'uploadScan should be a function');
    assert.strictEqual(typeof scanController.getScansByPatient, 'function', 'getScansByPatient should be a function');
    assert.strictEqual(typeof scanController.getScanMeta, 'function', 'getScanMeta should be a function');
    assert.strictEqual(typeof scanController.streamScan, 'function', 'streamScan should be a function');
    assert.strictEqual(typeof scanController.downloadScan, 'function', 'downloadScan should be a function');
    assert.strictEqual(typeof scanController.deleteScan, 'function', 'deleteScan should be a function');
    console.log('✅ Controller Structure Verification Passed');
} catch (e) {
    console.error('❌ Controller Structure Verification Failed');
    console.error(e);
    process.exit(1);
}

// Test 2: Routes are exported
try {
    assert.strictEqual(typeof scanRoutes, 'function', 'Router should be a function/object');
    console.log('✅ Router Export Verification Passed');
} catch (e) {
    console.error('❌ Router Export Verification Failed');
    console.error(e);
    process.exit(1);
}

console.log('Scans Service Tests Completed Successfully');
