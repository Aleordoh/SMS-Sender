const rateLimit = require('express-rate-limit')

// Rate limiting middleware for file uploads
const uploadLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 requests per windowMs
	message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
	keyGenerator: (req, res) => req.ip, // Use Express's computed IP (respects trust proxy)
	skip: (req, res) => false, // Don't skip validation
})

// Rate limiting middleware for connection tests
const testLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 20, // Limit each IP to 20 test requests per windowMs
	message: 'Demasiadas pruebas de conexión, por favor intente más tarde.',
	keyGenerator: (req, res) => req.ip, // Use Express's computed IP (respects trust proxy)
	skip: (req, res) => false, // Don't skip validation
})

module.exports = {
	uploadLimiter,
	testLimiter,
}
