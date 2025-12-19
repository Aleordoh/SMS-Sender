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
		this.port = config.port || process.env.GATEWAY_PORT || 80
		this.username = config.username || 'admin'
		this.password = config.password || 'admin'

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
	 * According to Synway SMG Gateway API v1.8.0 documentation:
	 * POST http://GateWayIP/API/TaskHandle
	 * Format: {"event":"txsms","userid":"...","num":"...","port":"...","encoding":"...","smsinfo":"..."}
	 */
	async sendSMS(phoneNumber, message, options = {}) {
		try {
			const url = `${this.baseUrl}/API/TaskHandle`

			// Prepare data according to API v1.8.0 spec
			// event: "txsms" - Send SMS
			// userid: User ID for tracking (optional)
			// num: Destination number(s), separated by comma
			// port: Port to use (-1 for auto, or specific port like "1,2,3")
			// encoding: 0 for bit7 (ASCII), 8 for UCS-2 (Unicode)
			// smsinfo: Message content (max 600 chars for bit7, 300 for UCS-2)
			const data = {
				event: 'txsms',
				userid: options.userid || '0',
				num: phoneNumber,
				port: options.port || '-1',
				encoding: this.detectEncoding(message),
				smsinfo: message,
			}

			const response = await axios.post(url, data, {
				timeout: 30000,
				headers: {
					'Content-Type': 'application/json',
				},
				auth: {
					username: this.username,
					password: this.password,
				},
			})

			// Response format: {"result":"ok","content":"taskid:0"} or {"result":"error","content":"error reason"}
			const isSuccess =
				response.data &&
				(response.data.result === 'ok' || response.status === 200)

			return {
				success: isSuccess,
				data: response.data,
				status: response.status,
				taskid: this.extractTaskId(response.data),
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
	 * Detect message encoding
	 * Returns "0" for ASCII (bit7) or "8" for Unicode (UCS-2)
	 */
	detectEncoding(message) {
		// Check if message contains non-ASCII characters
		const hasUnicode = /[^\x00-\x7F]/.test(message)
		return hasUnicode ? '8' : '0'
	}

	/**
	 * Extract task ID from response
	 * Response format: {"result":"ok","content":"taskid:123"}
	 */
	extractTaskId(responseData) {
		if (
			!responseData ||
			!responseData.content ||
			responseData.result !== 'ok'
		) {
			return null
		}

		const match = responseData.content.match(/taskid:(\d+)/)
		return match ? match[1] : null
	}

	/**
	 * Send multiple SMS messages
	 * @param {Array} recipients - Array of recipients with phone and message
	 * @param {Number} delayMs - Delay in milliseconds between each SMS (default: 6000ms)
	 */
	async sendBulkSMS(recipients, delayMs = 6000) {
		const results = []

		for (const recipient of recipients) {
			const result = await this.sendSMS(recipient.phone, recipient.message)
			results.push({
				phone: recipient.phone,
				message: recipient.message,
				...result,
			})

			// Configurable delay between messages to avoid overwhelming the gateway
			if (delayMs > 0) {
				await this.delay(delayMs)
			}
		}

		return results
	}

	/**
	 * Query SMS sending result
	 * Endpoint: POST http://GateWayIP/API/QueryInfo
	 * Event: querytxsms
	 */
	async querySMSResult(taskid) {
		try {
			const url = `${this.baseUrl}/API/QueryInfo`
			const data = {
				event: 'querytxsms',
				taskid: taskid.toString(),
			}

			const response = await axios.post(url, data, {
				timeout: 10000,
				headers: {
					'Content-Type': 'application/json',
				},
				auth: {
					username: this.username,
					password: this.password,
				},
			})

			return {
				success: response.data && response.data.result === 'ok',
				data: response.data,
			}
		} catch (error) {
			console.error(`Error querying SMS result:`, error.message)
			return {
				success: false,
				error: error.message,
			}
		}
	}

	/**
	 * Get port status
	 * Endpoint: POST http://GateWayIP/API/QueryInfo
	 * Event: getportinfo
	 */
	async getPortStatus() {
		try {
			const url = `${this.baseUrl}/API/QueryInfo`
			const data = {
				event: 'getportinfo',
			}

			const response = await axios.post(url, data, {
				timeout: 10000,
				headers: {
					'Content-Type': 'application/json',
				},
				auth: {
					username: this.username,
					password: this.password,
				},
			})

			return {
				success: response.data && response.data.result === 'ok',
				data: response.data,
			}
		} catch (error) {
			console.error(`Error getting port status:`, error.message)
			return {
				success: false,
				error: error.message,
			}
		}
	}

	/**
	 * Get port BS connection status
	 * Endpoint: POST http://GateWayIP/API/QueryInfo
	 * Event: getportconnectstate
	 */
	async getPortConnectionStatus() {
		try {
			const url = `${this.baseUrl}/API/QueryInfo`
			const data = {
				event: 'getportconnectstate',
			}

			const response = await axios.post(url, data, {
				timeout: 10000,
				headers: {
					'Content-Type': 'application/json',
				},
				auth: {
					username: this.username,
					password: this.password,
				},
			})

			return {
				success: response.data && response.data.result === 'ok',
				data: response.data,
			}
		} catch (error) {
			console.error(`Error getting port connection status:`, error.message)
			return {
				success: false,
				error: error.message,
			}
		}
	}

	/**
	 * Get wireless parameters information
	 * Endpoint: POST http://GateWayIP/API/QueryInfo
	 * Event: getwirelessinfo
	 * @param {string} type - Type of query: "porttype", "ICCID", "IMEI", "IMSI", "PhoneNo"
	 * @param {string} port - Port numbers separated by comma (optional)
	 */
	async getWirelessInfo(type, port = null) {
		try {
			const url = `${this.baseUrl}/API/QueryInfo`
			const data = {
				event: 'getwirelessinfo',
				type: type,
			}

			if (port) {
				data.port = port
			}

			const response = await axios.post(url, data, {
				timeout: 10000,
				headers: {
					'Content-Type': 'application/json',
				},
				auth: {
					username: this.username,
					password: this.password,
				},
			})

			return {
				success: response.data && response.data.result === 'ok',
				data: response.data,
			}
		} catch (error) {
			console.error(`Error getting wireless info:`, error.message)
			return {
				success: false,
				error: error.message,
			}
		}
	}

	/**
	 * Check gateway status
	 */
	async checkStatus() {
		try {
			// Use the port status endpoint to check if gateway is alive
			const result = await this.getPortStatus()
			return {
				success: result.success,
				status: result.data,
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

	/**
	 * Query received SMS messages
	 * Endpoint: POST http://GateWayIP/API/QueryInfo
	 * Event: queryrxsms
	 * @param {string} begintime - Start time in format YYYYMMDDHHmmss
	 * @param {string} endtime - End time in format YYYYMMDDHHmmss
	 * @param {string} port - Port numbers separated by comma (default: "1,2,3,4,5,6,7,8" for 8-port gateway)
	 * @param {string} phonenum - Phone number to filter (optional)
	 */
	async queryReceivedSMS(
		begintime,
		endtime,
		port = '1,2,3,4,5,6,7,8',
		phonenum = null
	) {
		try {
			const url = `${this.baseUrl}/API/QueryInfo`
			const data = {
				event: 'queryrxsms',
				begintime: begintime,
				endtime: endtime,
				port: port,
			}

			// Only add phonenum if provided
			if (phonenum) {
				data.phonenum = phonenum
			}

			const response = await axios.post(url, data, {
				timeout: 30000,
				headers: {
					'Content-Type': 'application/json',
				},
				auth: {
					username: this.username,
					password: this.password,
				},
			})

			return {
				success: response.data && response.data.result === 'ok',
				data: response.data,
				messages: this.parseReceivedMessages(response.data),
			}
		} catch (error) {
			console.error(`Error querying received SMS:`, error.message)
			return {
				success: false,
				error: error.message,
				messages: [],
			}
		}
	}

	/**
	 * Parse received SMS messages from API response
	 * The Synway API returns messages in format:
	 * "total:N;YYYYMMDDHHMMSS:PORT(X)(Y):PHONE:MESSAGE|E;..."
	 */
	parseReceivedMessages(responseData) {
		if (
			!responseData ||
			responseData.result !== 'ok' ||
			!responseData.content
		) {
			return []
		}

		try {
			const messages = []
			const content = responseData.content

			// If content is an array, parse it directly
			if (Array.isArray(content)) {
				content.forEach((item) => {
					if (item.smsinfo) {
						messages.push({
							phone: item.num || item.srcnum || '',
							message: item.smsinfo,
							time: item.time || item.rxtime || '',
							port: item.port || '',
						})
					}
				})
			}
			// If content is a string (Synway format), parse it
			else if (typeof content === 'string') {
				// Check if there are any messages
				const totalMatch = content.match(/total:(\d+)/)
				if (!totalMatch || parseInt(totalMatch[1]) === 0) {
					return []
				}

				// Format: "total:2;20251219203330:2(-1)(-1):5493815682688:Hola|E;20251219203336:2(-1)(-1):5493815682688:Quien sos|E"
				// Split by semicolon, skip first element (total:N)
				const parts = content.split(';').slice(1)

				parts.forEach((part) => {
					if (!part || part.trim().length === 0) return

					// Each part format: YYYYMMDDHHMMSS:PORT(X)(Y):PHONE:MESSAGE|E
					// Example: 20251219203330:2(-1)(-1):5493815682688:Hola|E
					const segments = part.split(':')

					if (segments.length >= 4) {
						const time = segments[0] // YYYYMMDDHHMMSS
						const portInfo = segments[1] // 2(-1)(-1)
						const phone = segments[2] // 5493815682688
						// Message may contain colons, so join remaining segments
						const messageWithFlag = segments.slice(3).join(':') // Hola|E

						// Extract port number (first digit(s) before parenthesis)
						const portMatch = portInfo.match(/^(\d+)/)
						const port = portMatch ? portMatch[1] : ''

						// Remove |E flag from message
						const message = messageWithFlag.replace(/\|E$/, '')

						messages.push({
							phone: phone.trim(),
							message: message.trim(),
							time: time.trim(),
							port: port,
						})
					}
				})
			}

			return messages
		} catch (error) {
			console.error('Error parsing received messages:', error)
			console.error('Response data:', JSON.stringify(responseData))
			return []
		}
	}
}

module.exports = SynwayGateway
