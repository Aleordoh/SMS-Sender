const express = require('express')
const router = express.Router()
const SMSController = require('../controllers/smsController')
const upload = require('../middlewares/uploadMiddleware')
const { uploadLimiter, testLimiter } = require('../middlewares/rateLimitMiddleware')

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
router.post('/save-port-config', SMSController.savePortConfig)
router.post('/query-received', SMSController.queryReceivedSMS)
router.get('/download-received', SMSController.downloadReceivedSMS)

module.exports = router
