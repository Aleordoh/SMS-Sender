const express = require('express')
const router = express.Router()
const loginController = require('../controllers/loginController.js')

router.get('/', loginController.login)
router.post('/login', loginController.loginProcess)
router.get('/logout', loginController.logout)
module.exports = router