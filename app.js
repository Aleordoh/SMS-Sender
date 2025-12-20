const express = require('express')
const path = require('path')
const app = express()

// View engine setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/manual', express.static(path.join(__dirname, 'manual')))

// Routes
const smsRoutes = require('./routes/sms')
app.use('/sms', smsRoutes)

// Root route redirect
app.get('/', (req, res) => {
	res.redirect('/sms')
})

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
