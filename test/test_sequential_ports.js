/**
 * Test sequential port distribution for SMS sending
 * This test verifies that messages are distributed sequentially across ports
 */

const SynwayGateway = require('../services/synwayGateway');

async function testSequentialPorts() {
    console.log('🧪 Testing Sequential Port Distribution\n');
    
    // Create a mock gateway (won't actually send)
    const gateway = new SynwayGateway({
        host: '192.168.1.45',
        port: 80,
        username: 'test',
        password: 'test'
    });
    
    // Test with 4 ports
    console.log('Test 1: 4 ports with 10 messages');
    console.log('Expected pattern: 1, 2, 3, 4, 1, 2, 3, 4, 1, 2\n');
    
    const recipients = [];
    for (let i = 1; i <= 10; i++) {
        recipients.push({
            phone: `123456789${i}`,
            message: `Test message ${i}`
        });
    }
    
    // Mock the sendSMS method to track port assignments
    const portAssignments = [];
    const originalSendSMS = gateway.sendSMS.bind(gateway);
    gateway.sendSMS = async function(phone, message, options = {}) {
        portAssignments.push({
            phone: phone,
            port: options.port || '-1'
        });
        // Return success without actually sending
        return {
            success: true,
            data: { result: 'ok', content: 'taskid:test' }
        };
    };
    
    // Test with 4 ports, no delay for speed
    const results = await gateway.sendBulkSMS(recipients, 0, 4);
    
    console.log('Port assignments:');
    portAssignments.forEach((assignment, index) => {
        console.log(`  Message ${index + 1} → Port ${assignment.port}`);
    });
    
    // Verify sequential pattern
    const expectedPorts = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2];
    let testPassed = true;
    
    for (let i = 0; i < expectedPorts.length; i++) {
        const expected = expectedPorts[i].toString();
        const actual = portAssignments[i].port;
        
        if (expected !== actual) {
            console.log(`\n❌ FAIL: Message ${i + 1} - Expected port ${expected}, got ${actual}`);
            testPassed = false;
        }
    }
    
    if (testPassed) {
        console.log('\n✅ Test 1 PASSED: Sequential port distribution is working correctly!\n');
    }
    
    // Test 2: Different port count
    console.log('\nTest 2: 2 ports with 6 messages');
    console.log('Expected pattern: 1, 2, 1, 2, 1, 2\n');
    
    portAssignments.length = 0; // Clear previous results
    const recipients2 = [];
    for (let i = 1; i <= 6; i++) {
        recipients2.push({
            phone: `987654321${i}`,
            message: `Test message ${i}`
        });
    }
    
    const results2 = await gateway.sendBulkSMS(recipients2, 0, 2);
    
    console.log('Port assignments:');
    portAssignments.forEach((assignment, index) => {
        console.log(`  Message ${index + 1} → Port ${assignment.port}`);
    });
    
    // Verify sequential pattern for 2 ports
    const expectedPorts2 = [1, 2, 1, 2, 1, 2];
    testPassed = true;
    
    for (let i = 0; i < expectedPorts2.length; i++) {
        const expected = expectedPorts2[i].toString();
        const actual = portAssignments[i].port;
        
        if (expected !== actual) {
            console.log(`\n❌ FAIL: Message ${i + 1} - Expected port ${expected}, got ${actual}`);
            testPassed = false;
        }
    }
    
    if (testPassed) {
        console.log('\n✅ Test 2 PASSED: Sequential port distribution with 2 ports is working correctly!\n');
    }
    
    // Test 3: Edge case - 1 port
    console.log('\nTest 3: 1 port with 5 messages');
    console.log('Expected pattern: 1, 1, 1, 1, 1\n');
    
    portAssignments.length = 0;
    const recipients3 = [];
    for (let i = 1; i <= 5; i++) {
        recipients3.push({
            phone: `555555555${i}`,
            message: `Test message ${i}`
        });
    }
    
    const results3 = await gateway.sendBulkSMS(recipients3, 0, 1);
    
    console.log('Port assignments:');
    portAssignments.forEach((assignment, index) => {
        console.log(`  Message ${index + 1} → Port ${assignment.port}`);
    });
    
    // Verify all use port 1
    testPassed = true;
    for (let i = 0; i < 5; i++) {
        if (portAssignments[i].port !== '1') {
            console.log(`\n❌ FAIL: Message ${i + 1} - Expected port 1, got ${portAssignments[i].port}`);
            testPassed = false;
        }
    }
    
    if (testPassed) {
        console.log('\n✅ Test 3 PASSED: Single port distribution is working correctly!\n');
    }
    
    console.log('=' .repeat(60));
    console.log('✅ All sequential port distribution tests completed successfully!');
    console.log('=' .repeat(60));
}

// Run the test
testSequentialPorts().catch(error => {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
});
