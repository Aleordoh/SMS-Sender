const express = require('express')
const path = require('path')
const app = express()
const session = require('express-session')
const loginMiddleware = require('./middlewares/loginMiddleware')

// View engine setup
app.set('trust proxy', 1)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/manual', express.static(path.join(__dirname, 'manual')))
app.use(
	session({
		secret: 'qeaQltMMiwqAWt07',
		resave: false,
		saveUninitialized: true,
		cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day,
	})
)

// Routes
const smsRoutes = require('./routes/sms.Routes')
app.use('/sms', loginMiddleware, smsRoutes)

// Login
const loginRoutes = require('./routes/login.Routes')
app.use('/', loginRoutes)

// Error handler
app.use((err, req, res, next) => {
	console.error(err.stack)
	res.status(500).render('upload', {
		title: 'Error',
		error: err.message,
		success: null,
	})
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
	console.log(`Open http://localhost:${PORT} in your browser`)
})
