#!/usr/bin/env node

/**
 * Test SMS sending with specific port selection
 */

const SynwayGateway = require('../services/synwayGateway')

const config = {
	host: process.env.GATEWAY_HOST || '192.168.1.45',
	port: process.env.GATEWAY_PORT || 80,
	protocol: process.env.GATEWAY_PROTOCOL || 'http',
	username: process.env.GATEWAY_USERNAME || 'ApiUserAdmin',
	password: process.env.GATEWAY_PASSWORD || 'acuerdo1234',
}

const gateway = new SynwayGateway(config)

async function testWithSpecificPort() {
	const testPhone = process.env.TEST_PHONE || '3815682688'
	const testMessage = 'Test with specific port'

	console.log('\n' + '='.repeat(60))
	console.log('📱 Testing SMS with SPECIFIC PORT Selection')
	console.log('='.repeat(60) + '\n')

	// Try with each port individually
	for (let port = 1; port <= 4; port++) {
		console.log(`\n🔌 Testing with Port ${port}...`)
		console.log('-'.repeat(40))

		const result = await gateway.sendSMS(testPhone, testMessage, {
			port: port.toString(), // Use specific port instead of -1
		})

		console.log('Response:', JSON.stringify(result.data, null, 2))
		console.log('Success:', result.success)
		console.log('Task ID:', result.taskid)

		if (result.taskid) {
			// Wait and query
			await new Promise((resolve) => setTimeout(resolve, 3000))
			const queryResult = await gateway.querySMSResult(result.taskid)
			console.log('Query Result:', JSON.stringify(queryResult.data, null, 2))
		}
	}

	console.log('\n' + '='.repeat(60) + '\n')
}

testWithSpecificPort().catch(console.error)
