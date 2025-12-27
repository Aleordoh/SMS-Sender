const express = require('express')
const path = require('path')
const app = express()
const session = require('express-session')
const loginMiddleware = require('./middlewares/loginMiddleware')

// View engine setup
app.set('trust proxy', 1)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Aumentar timeouts para solicitudes largas (envío de SMS en bulk - hasta 400 mensajes)
const server = app.listen(process.env.PORT || 3000, () => {
	console.log(`Server running on port ${process.env.PORT || 3000}`)
	console.log(
		`Open http://localhost:${process.env.PORT || 3000} in your browser`
	)
})

// Configurar timeouts del servidor HTTP
// 400 mensajes × 6s = 2400s (40 min), configuramos 3000s (50 min) por seguridad
server.keepAliveTimeout = 3001000 // 3001 segundos
server.headersTimeout = 3002000 // 3002 segundos (debe ser > keepAliveTimeout)

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
