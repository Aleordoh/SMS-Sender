const SynwayGateway = require('../services/synwayGateway')
const FileParser = require('../services/fileParser')
const fs = require('fs')

/**
 * SMS Controller
 * Handles SMS sending operations
 */
class SMSController {
	/**
	 * Show upload form
	 */
	static showUploadForm(req, res) {
		res.render('upload', {
			title: 'SMS Sender - Synway Gateway',
			error: null,
			success: null,
			portCount: req.session.portCount || process.env.SMS_PORT_COUNT || 4,
		})
	}

	/**
	 * Process file upload and send SMS
	 */
	static async processUpload(req, res) {
		try {
			// Check if file was uploaded
			if (!req.file) {
				return res.render('upload', {
					title: 'SMS Sender - Synway Gateway',
					error: 'Please select a file to upload',
					success: null,
				})
			}

			// Parse the uploaded file
			const recipients = await FileParser.parseFile(req.file.path)

			// Validate recipients
			const validation = FileParser.validateRecipients(recipients)
			if (!validation.isValid) {
				// Clean up uploaded file
				fs.unlinkSync(req.file.path)

				return res.render('upload', {
					title: 'SMS Sender - Synway Gateway',
					error: `File validation failed:\n${validation.errors.join('\n')}`,
					success: null,
				})
			}

			// Get gateway configuration from environment
			const gatewayConfig = {
				host: process.env.GATEWAY_HOST || '192.168.1.45',
				port: process.env.GATEWAY_PORT || 80,
				protocol: (process.env.GATEWAY_PROTOCOL || 'http').toLowerCase(),
				smsEndpoint: process.env.GATEWAY_SMS_ENDPOINT || '/API/TaskHandle',
				username: process.env.GATEWAY_USERNAME || 'ApiUserAdmin',
				password: process.env.GATEWAY_PASSWORD || 'acuerdo1234',
			}

			const gateway = new SynwayGateway(gatewayConfig)

			// Send SMS messages with configurable delay and port count
			const smsDelay = parseInt(process.env.SMS_DELAY || 6000)
			const portCount = parseInt(req.session.portCount || process.env.SMS_PORT_COUNT || 4)
			const results = await gateway.sendBulkSMS(recipients, smsDelay, portCount)

			// Clean up uploaded file
			fs.unlinkSync(req.file.path)

			// Render results
			res.render('results', {
				title: 'SMS Sending Results',
				results: results,
				totalSent: results.filter((r) => r.success).length,
				totalFailed: results.filter((r) => !r.success).length,
				total: results.length,
				sentTimestamp: Date.now(),
			})
		} catch (error) {
			console.error('Error processing upload:', error)

			// Clean up uploaded file if it exists
			if (req.file && fs.existsSync(req.file.path)) {
				fs.unlinkSync(req.file.path)
			}

			res.render('upload', {
				title: 'SMS Sender - Synway Gateway',
				error: `Error: ${error.message}`,
				success: null,
			})
		}
	}

	/**
	 * Show configuration page
	 */
	static showConfig(req, res) {
		res.render('config', {
			title: 'Gateway Configuration',
			config: {
				host: process.env.GATEWAY_HOST || '192.168.1.45',
				port: process.env.GATEWAY_PORT || 80,
				protocol: (process.env.GATEWAY_PROTOCOL || 'http').toLowerCase(),
				username: process.env.GATEWAY_USERNAME || 'ApiUserAdmin',
				password: process.env.GATEWAY_PASSWORD || 'acuerdo1234',
				sms_delay: process.env.SMS_DELAY || 6000,
				port_count: req.session.portCount || process.env.SMS_PORT_COUNT || 4,
			},
		})
	}

	/**
	 * Test gateway connection
	 */
	static async testConnection(req, res) {
		try {
			const gatewayConfig = {
				host:
					req.body.gateway_host || process.env.GATEWAY_HOST || '192.168.1.45',
				port: req.body.gateway_port || process.env.GATEWAY_PORT || undefined,
				protocol: (
					req.body.gateway_protocol ||
					process.env.GATEWAY_PROTOCOL ||
					'http'
				).toLowerCase(),
				username:
					req.body.gateway_username ||
					process.env.GATEWAY_USERNAME ||
					'ApiUserAdmin',
				password:
					req.body.gateway_password ||
					process.env.GATEWAY_PASSWORD ||
					'acuerdo1234',
			}

			const gateway = new SynwayGateway(gatewayConfig)
			const status = await gateway.checkStatus()

			res.json({
				success: status.success,
				message: status.success
					? 'Connection successful'
					: `Connection failed: ${
							status.error ||
							(status.status && `HTTP ${status.status.statusCode}`)
					  }`,
				status: status.status,
			})
		} catch (error) {
			res.json({
				success: false,
				message: `Error: ${error.message}`,
			})
		}
	}

	/**
	 * Query received SMS messages
	 */
	static async queryReceivedSMS(req, res) {
		try {
			const { begintime, endtime, port, phonenum } = req.body

			const gatewayConfig = {
				host: process.env.GATEWAY_HOST || '192.168.1.45',
				port: process.env.GATEWAY_PORT || 80,
				protocol: (process.env.GATEWAY_PROTOCOL || 'http').toLowerCase(),
				username: process.env.GATEWAY_USERNAME || 'ApiUserAdmin',
				password: process.env.GATEWAY_PASSWORD || 'acuerdo1234',
			}

			const gateway = new SynwayGateway(gatewayConfig)
			// Port defaults to "1,2,3,4,5,6,7,8" in gateway service
			const result = await gateway.queryReceivedSMS(
				begintime,
				endtime,
				port,
				phonenum
			)

			res.json({
				success: result.success,
				messages: result.messages,
				data: result.data,
			})
		} catch (error) {
			res.json({
				success: false,
				error: error.message,
				messages: [],
			})
		}
	}

	/**
	 * Show inbox page for monitoring received messages
	 */
	static showInbox(req, res) {
		res.render('inbox', {
			title: 'Mensajes Recibidos - SMS Sender',
			portCount: req.session.portCount || process.env.SMS_PORT_COUNT || 4,
		})
	}

	/**
	 * Save port configuration
	 */
	static savePortConfig(req, res) {
		try {
			const portCount = parseInt(req.body.port_count)
			
			// Validate port count (1-8)
			if (isNaN(portCount) || portCount < 1 || portCount > 8) {
				return res.json({
					success: false,
					message: 'Port count must be between 1 and 8'
				})
			}
			
			// Save to session
			req.session.portCount = portCount
			
			res.json({
				success: true,
				message: `Configuration saved. Using ${portCount} port(s) for sequential SMS sending.`,
				portCount: portCount
			})
		} catch (error) {
			res.json({
				success: false,
				message: `Error: ${error.message}`
			})
		}
	}

	/**
	 * Download received SMS as CSV
	 */
	static async downloadReceivedSMS(req, res) {
		try {
			const { begintime, endtime, port, phonenum } = req.query

			const gatewayConfig = {
				host: process.env.GATEWAY_HOST || '192.168.1.45',
				port: process.env.GATEWAY_PORT || 80,
				protocol: (process.env.GATEWAY_PROTOCOL || 'http').toLowerCase(),
				username: process.env.GATEWAY_USERNAME || 'ApiUserAdmin',
				password: process.env.GATEWAY_PASSWORD || 'acuerdo1234',
			}

			const gateway = new SynwayGateway(gatewayConfig)
			// Port defaults to "1,2,3,4,5,6,7,8" in gateway service
			const result = await gateway.queryReceivedSMS(
				begintime,
				endtime,
				port,
				phonenum
			)

			if (!result.success || result.messages.length === 0) {
				return res.status(404).send('No messages found')
			}

			// Generate CSV
			const csvRows = []
			csvRows.push('Phone,Message,Time,Port') // Header

			result.messages.forEach((msg) => {
				const row = [
					`"${msg.phone}"`,
					`"${(msg.message || '').replace(/"/g, '""')}"`,
					`"${msg.time}"`,
					`"${msg.port}"`,
				]
				csvRows.push(row.join(','))
			})

			const csv = csvRows.join('\n')

			res.setHeader('Content-Type', 'text/csv')
			res.setHeader(
				'Content-Disposition',
				`attachment; filename="received_sms_${Date.now()}.csv"`
			)
			res.send(csv)
		} catch (error) {
			res.status(500).send(`Error: ${error.message}`)
		}
	}
}

module.exports = SMSController
