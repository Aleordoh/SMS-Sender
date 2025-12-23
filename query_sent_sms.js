#!/usr/bin/env node

/**
 * Query sent SMS history from gateway outbox
 */

const SynwayGateway = require('./services/synwayGateway')

const config = {
	host: process.env.GATEWAY_HOST || '192.168.1.45',
	port: process.env.GATEWAY_PORT || 80,
	protocol: process.env.GATEWAY_PROTOCOL || 'http',
	username: process.env.GATEWAY_USERNAME || 'ApiUserAdmin',
	password: process.env.GATEWAY_PASSWORD || 'acuerdo1234',
}

const gateway = new SynwayGateway(config)

async function querySentSMS() {
	console.log('\n' + '='.repeat(60))
	console.log('📤 Query Sent SMS from Gateway Outbox')
	console.log('='.repeat(60) + '\n')

	// Get last 24 hours
	const now = new Date()
	const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

	const endtime = now
		.toISOString()
		.replace(/[-:T.Z]/g, '')
		.substring(0, 14)
	const begintime = yesterday
		.toISOString()
		.replace(/[-:T.Z]/g, '')
		.substring(0, 14)

	console.log(`Querying SMS from ${begintime} to ${endtime} (last 24 hours)`)
	console.log('-'.repeat(60) + '\n')

	// Note: The gateway class doesn't have querySentSMS, so we'll use queryReceivedSMS
	// But let's try to implement a query for sent SMS
	const axios = require('axios')

	try {
		const url = `${gateway.baseUrl}/API/QueryInfo`
		const data = {
			event: 'querysxsms', // Query sent SMS
			begintime: begintime,
			endtime: endtime,
			port: '1,2,3,4',
		}

		const response = await axios.post(url, data, {
			timeout: 30000,
			headers: {
				'Content-Type': 'application/json',
			},
			auth: {
				username: gateway.username,
				password: gateway.password,
			},
		})

		console.log('Response:', JSON.stringify(response.data, null, 2))

		if (response.data && response.data.result === 'ok') {
			console.log('\n✅ Query successful')
			if (response.data.content) {
				console.log('Content:', response.data.content)
			}
		} else {
			console.log('❌ Query failed or no data')
		}
	} catch (error) {
		console.error('Error:', error.message)
	}

	console.log('\n' + '='.repeat(60) + '\n')
}

querySentSMS().catch(console.error)
