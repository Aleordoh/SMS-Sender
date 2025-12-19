const axios = require('axios')

/**
 * Synway SMG4008-8WA Gateway HTTP API Client
 * Based on Synway Gateway HTTP API documentation
 */
class SynwayGateway {
	constructor(config) {
		this.host = config.host || '192.168.1.45'
		this.protocol = (
			config.protocol ||
			process.env.GATEWAY_PROTOCOL ||
			'http'
		).toLowerCase()
		// If port is explicitly provided, use it; otherwise choose default by protocol
		this.port = config.port || (this.protocol === 'https' ? 443 : 80)
		this.username = config.username || 'admin'
		this.password = config.password || 'admin'

		// Endpoint configurable (default '/API/TaskHandle')
		const endpoint =
			config.smsEndpoint ||
			process.env.GATEWAY_SMS_ENDPOINT ||
			'/API/TaskHandle'
		this.smsEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

		// Validate host to prevent SSRF
		this.validateHost(this.host)

		this.baseUrl = `${this.protocol}://${this.host}:${this.port}`
	}

	/**
	 * Validate host to prevent SSRF attacks
	 * Allows: IP addresses, hostnames, but blocks dangerous protocols
	 */
	validateHost(host) {
		// Block file:// and other dangerous protocols
		if (host.includes('://')) {
			throw new Error(
				'Invalid host: protocol not allowed in host configuration'
			)
		}

		// Basic validation - should not be empty
		if (!host || host.trim().length === 0) {
			throw new Error('Host cannot be empty')
		}
	}

	/**
	 * Send SMS using HTTP API
	 * According to Synway documentation, the HTTP API format is:
	 * http://ip:port/API/TaskHandle
	 */
	async sendSMS(phoneNumber, message) {
		try {
			// Format for /API/TaskHandle
			const data = {
				op: 'SmsSend',
				username: this.username,
				password: this.password,
				dst: phoneNumber,
				msg: message,
			}

			const url = `${this.baseUrl}${this.smsEndpoint}`

			// Convert to URLSearchParams to send as application/x-www-form-urlencoded
			// Many hardware gateways do not support JSON payloads
			const params = new URLSearchParams()
			params.append('op', 'SmsSend')
			params.append('username', this.username)
			params.append('password', this.password)
			params.append('dst', phoneNumber)
			params.append('msg', message)

			const response = await axios.post(url, params, {
				timeout: 30000,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			})

			return {
				success: true,
				data: response.data,
				status: response.status,
			}
		} catch (error) {
			console.error(`Error sending SMS to ${phoneNumber}:`, error.message)
			return {
				success: false,
				error: error.message,
				phoneNumber: phoneNumber,
			}
		}
	}

	/**
	 * Send multiple SMS messages
	 */
	async sendBulkSMS(recipients) {
		const results = []

		for (const recipient of recipients) {
			const result = await this.sendSMS(recipient.phone, recipient.message)
			results.push({
				phone: recipient.phone,
				message: recipient.message,
				...result,
			})

			// Small delay between messages to avoid overwhelming the gateway
			await this.delay(100)
		}

		return results
	}

	/**
	 * Check gateway status
	 */
	async checkStatus() {
		try {
			const url = `${this.baseUrl}/`
			// Consider 200 (OK), 401/403 (auth required) as reachable
			const response = await axios.get(url, {
				timeout: 5000,
				validateStatus: () => true,
			})

			const reachable = [200, 401, 403].includes(response.status)
			return {
				success: reachable,
				status: {
					statusCode: response.status,
					url,
				},
			}
		} catch (error) {
			return {
				success: false,
				error: error.message,
			}
		}
	}

	/**
	 * Utility delay function
	 */
	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}
}

module.exports = SynwayGateway
