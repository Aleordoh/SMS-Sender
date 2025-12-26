const rateLimit = require('express-rate-limit')

// Rate limiting middleware for file uploads
const uploadLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 requests per windowMs
	message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
})

// Rate limiting middleware for connection tests
const testLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 20, // Limit each IP to 20 test requests per windowMs
	message: 'Demasiadas pruebas de conexión, por favor intente más tarde.',
})

module.exports = {
	uploadLimiter,
	testLimiter,
}
