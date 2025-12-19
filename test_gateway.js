#!/usr/bin/env node

/**
 * Test script for Synway Gateway API
 * Tests connectivity and basic operations
 */

const SynwayGateway = require('./services/synwayGateway')

// Gateway configuration from environment or defaults
const config = {
	host: process.env.GATEWAY_HOST || '192.168.1.45',
	port: process.env.GATEWAY_PORT || 80,
	protocol: process.env.GATEWAY_PROTOCOL || 'http',
	username: process.env.GATEWAY_USERNAME || 'ApiUserAdmin',
	password: process.env.GATEWAY_PASSWORD || 'acuerdo1234',
}

const gateway = new SynwayGateway(config)

console.log('🔧 Synway Gateway API Test')
console.log('='.repeat(50))
console.log(`Gateway: ${config.protocol}://${config.host}:${config.port}`)
console.log(`Username: ${config.username}`)
console.log('='.repeat(50))
console.log()

async function runTests() {
	try {
		// Test 1: Get Port Status
		console.log('📊 Test 1: Getting port status...')
		const portStatus = await gateway.getPortStatus()
		if (portStatus.success) {
			console.log('✅ Port status retrieved successfully')
			console.log('Response:', JSON.stringify(portStatus.data, null, 2))
		} else {
			console.log('❌ Failed to get port status')
			console.log('Error:', portStatus.error)
		}
		console.log()

		// Test 2: Get Port Connection Status
		console.log('📡 Test 2: Getting port connection status...')
		const connectionStatus = await gateway.getPortConnectionStatus()
		if (connectionStatus.success) {
			console.log('✅ Connection status retrieved successfully')
			console.log('Response:', JSON.stringify(connectionStatus.data, null, 2))
		} else {
			console.log('❌ Failed to get connection status')
			console.log('Error:', connectionStatus.error)
		}
		console.log()

		// Test 3: Get Wireless Info (Port Type)
		console.log('📶 Test 3: Getting wireless info (port type)...')
		const wirelessInfo = await gateway.getWirelessInfo('porttype')
		if (wirelessInfo.success) {
			console.log('✅ Wireless info retrieved successfully')
			console.log('Response:', JSON.stringify(wirelessInfo.data, null, 2))
		} else {
			console.log('❌ Failed to get wireless info')
			console.log('Error:', wirelessInfo.error)
		}
		console.log()

		// Test 4: Send Test SMS (only if phone number provided)
		const testPhone = process.env.TEST_PHONE
		if (testPhone) {
			console.log(`📱 Test 4: Sending test SMS to ${testPhone}...`)
			const smsResult = await gateway.sendSMS(
				testPhone,
				'Test message from Synway Gateway API'
			)
			if (smsResult.success) {
				console.log('✅ SMS sent successfully')
				console.log('Response:', JSON.stringify(smsResult.data, null, 2))
				if (smsResult.taskid) {
					console.log(`Task ID: ${smsResult.taskid}`)

					// Wait a bit and query the result
					console.log('⏳ Waiting 3 seconds before querying result...')
					await new Promise((resolve) => setTimeout(resolve, 3000))

					console.log('🔍 Querying SMS send result...')
					const queryResult = await gateway.querySMSResult(smsResult.taskid)
					if (queryResult.success) {
						console.log('✅ Query successful')
						console.log('Response:', JSON.stringify(queryResult.data, null, 2))
					} else {
						console.log('❌ Failed to query result')
						console.log('Error:', queryResult.error)
					}
				}
			} else {
				console.log('❌ Failed to send SMS')
				console.log('Error:', smsResult.error)
			}
		} else {
			console.log(
				'⏭️  Test 4: Skipped (set TEST_PHONE environment variable to test SMS sending)'
			)
		}
		console.log()

		console.log('='.repeat(50))
		console.log('✅ Tests completed')
	} catch (error) {
		console.error('❌ Test failed with error:', error.message)
		console.error(error)
		process.exit(1)
	}
}

// Run tests
runTests().catch((error) => {
	console.error('Fatal error:', error)
	process.exit(1)
})
