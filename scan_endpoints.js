const axios = require('axios')

const config = {
	host: '192.168.1.45',
	port: 80,
	username: 'ApiUserAdmin',
	password: 'acuerdo1234',
}

const baseUrl = `http://${config.host}:${config.port}`

async function checkEndpoint(endpoint) {
	try {
		const url = `${baseUrl}${endpoint}`
		const response = await axios.get(url, {
			timeout: 2000,
			validateStatus: () => true,
			auth: {
				username: config.username,
				password: config.password,
			},
		})
		console.log(`${endpoint}: ${response.status}`)
	} catch (error) {
		// console.log(`${endpoint}: ${error.message}`)
	}
}

async function scan() {
	const endpoints = [
		'/API/TaskHandle',
		'/api/taskhandle',
		'/API/SmsSend',
		'/sms/send',
		'/sendSMS',
		'/sendsms',
		'/sms',
		'/api/sms',
		'/cgi-bin/sms_send',
		'/goform/formSMS',
		'/xml/sms.xml',
	]

	console.log('Scanning endpoints...')
	for (const ep of endpoints) {
		await checkEndpoint(ep)
	}
}

scan()
