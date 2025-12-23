#!/usr/bin/env node

/**
 * Debug script to analyze SMS sending issues
 * Tests the full SMS send and verify flow
 */

const SynwayGateway = require('./services/synwayGateway')

// Gateway configuration
const config = {
	host: process.env.GATEWAY_HOST || '192.168.1.45',
	port: process.env.GATEWAY_PORT || 80,
	protocol: process.env.GATEWAY_PROTOCOL || 'http',
	username: process.env.GATEWAY_USERNAME || 'ApiUserAdmin',
	password: process.env.GATEWAY_PASSWORD || 'acuerdo1234',
}

const gateway = new SynwayGateway(config)

async function debug() {
	console.log('\n' + '='.repeat(60))
	console.log('🔍 DEBUG: SMS SENDING ISSUE ANALYSIS')
	console.log('='.repeat(60) + '\n')

	try {
		// Step 1: Check port status
		console.log('📊 STEP 1: Check Gateway Port Status')
		console.log('-'.repeat(60))
		const portStatus = await gateway.getPortStatus()
		console.log(
			'Port Status Response:',
			JSON.stringify(portStatus.data, null, 2)
		)

		if (portStatus.success) {
			const states =
				portStatus.data.content
					.match(/portstate:([0-9,]+);/)?.[1]
					?.split(',') || []
			console.log(
				'Port States:',
				states
					.map((s, i) => `Port ${i + 1}: ${getPortState(parseInt(s))}`)
					.join(', ')
			)
		}
		console.log()

		// Step 2: Check connection status
		console.log('📡 STEP 2: Check Port Connection Status')
		console.log('-'.repeat(60))
		const connStatus = await gateway.getPortConnectionStatus()
		console.log(
			'Connection Status Response:',
			JSON.stringify(connStatus.data, null, 2)
		)

		if (connStatus.success) {
			const states =
				connStatus.data.content
					.match(/ConnectState:([0-9,]+)/)?.[1]
					?.split(',') || []
			console.log(
				'Connection States:',
				states
					.map((s, i) => `Port ${i + 1}: ${getConnectState(parseInt(s))}`)
					.join(', ')
			)
		}
		console.log()

		// Step 3: Get wireless info
		console.log('📶 STEP 3: Get Wireless Port Types')
		console.log('-'.repeat(60))
		const wirelessInfo = await gateway.getWirelessInfo('porttype')
		console.log(
			'Wireless Info Response:',
			JSON.stringify(wirelessInfo.data, null, 2)
		)
		console.log()

		// Step 4: Send test SMS with explicit port
		const testPhone = process.env.TEST_PHONE || '5491234567890'
		const testMessage = 'Test message - Prueba de envío'

		console.log(`📱 STEP 4: Send Test SMS with Auto Port Selection`)
		console.log('-'.repeat(60))
		console.log(`Phone: ${testPhone}`)
		console.log(`Message: ${testMessage}`)
		console.log(`Encoding: ${gateway.detectEncoding(testMessage)}`)

		const smsResult = await gateway.sendSMS(testPhone, testMessage)
		console.log('Gateway Response:', JSON.stringify(smsResult.data, null, 2))
		console.log('SMS Result Success:', smsResult.success)

		if (smsResult.taskid) {
			console.log(`Task ID: ${smsResult.taskid}`)
			console.log()

			// Step 5: Wait and query result
			console.log('⏳ STEP 5: Query SMS Result')
			console.log('-'.repeat(60))
			console.log('Waiting 5 seconds for gateway to process...')

			for (let i = 5; i > 0; i--) {
				process.stdout.write(`\r${i} seconds remaining...`)
				await new Promise((resolve) => setTimeout(resolve, 1000))
			}
			console.log('\n')

			const queryResult = await gateway.querySMSResult(smsResult.taskid)
			console.log('Query Response:', JSON.stringify(queryResult.data, null, 2))

			// Parse the response to understand delivery status
			if (queryResult.data && queryResult.data.content) {
				const content = queryResult.data.content
				console.log('\n📋 ANALYSIS:')
				console.log(`Raw content: ${content}`)

				// Format: [taskid:N:delivery_status;attempts:phone:state;...]
				const parts = content.match(/taskid:(\d+):(\d+)/)?.[0]?.split(':') || []
				if (parts.length >= 3) {
					const taskid = parts[1]
					const deliveryStatus = parseInt(parts[2])
					console.log(`Task ID: ${taskid}`)
					console.log(
						`Delivery Status: ${deliveryStatus} (${getDeliveryStatus(
							deliveryStatus
						)})`
					)
				}
			}
		}

		console.log('\n' + '='.repeat(60))
		console.log('✅ Debug analysis complete')
		console.log('='.repeat(60) + '\n')
	} catch (error) {
		console.error('❌ Error during debug:', error.message)
		process.exit(1)
	}
}

function getPortState(state) {
	const states = {
		0: 'Idle',
		1: 'Off-hook',
		2: 'Ringing',
		3: 'Talking',
		4: 'Dialing',
		5: 'Dialing',
		6: 'Dialing',
		7: 'Pending',
		9: 'Ringback',
		10: 'Interior',
		11: 'Unavailable',
	}
	return states[state] || `Unknown (${state})`
}

function getConnectState(state) {
	const states = {
		0: 'Unconnected',
		1: 'Connected',
		2: 'Connecting',
		3: 'Rejected',
		4: 'Unknown',
		5: 'Roaming',
	}
	return states[state] || `Unknown (${state})`
}

function getDeliveryStatus(status) {
	// Based on Synway API documentation
	// 0 = Sent/Accepted
	// 1 = Delivery pending/In progress
	// 2 = Delivered
	// Other values indicate various delivery states
	const statuses = {
		0: 'Sent/Accepted',
		1: 'In Progress',
		2: 'Delivered',
		3: 'Failed',
	}
	return statuses[status] || `Unknown State (${status})`
}

debug()
