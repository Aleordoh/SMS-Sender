const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const rateLimit = require('express-rate-limit')
const SMSController = require('../controllers/smsController')

// Rate limiting middleware
const uploadLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 requests per windowMs
	message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
})

const testLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 20, // Limit each IP to 20 test requests per windowMs
	message: 'Demasiadas pruebas de conexión, por favor intente más tarde.',
})

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/uploads/')
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		cb(null, 'sms-' + uniqueSuffix + path.extname(file.originalname))
	},
})

const fileFilter = (req, file, cb) => {
	const allowedExtensions = ['.xlsx', '.xls', '.csv']
	const ext = path.extname(file.originalname).toLowerCase()

	if (allowedExtensions.includes(ext)) {
		cb(null, true)
	} else {
		cb(new Error('Only XLSX and CSV files are allowed'), false)
	}
}

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
})

// Routes
router.get('/', SMSController.showUploadForm)
router.post(
	'/upload',
	uploadLimiter,
	upload.single('file'),
	SMSController.processUpload
)
router.get('/config', SMSController.showConfig)
router.get('/inbox', SMSController.showInbox)
router.post('/test-connection', testLimiter, SMSController.testConnection)
router.post('/query-received', SMSController.queryReceivedSMS)
router.get('/download-received', SMSController.downloadReceivedSMS)

module.exports = router
