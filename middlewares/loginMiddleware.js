// Middleware de autenticación
const requireLogin = (req, res, next) => {
	if (!req.session.user) {
		// Si es una petición AJAX/JSON, devolver error JSON en lugar de redirect
		if (
			req.xhr ||
			req.headers.accept?.indexOf('json') > -1 ||
			req.path.includes('/api/') ||
			req.path.includes('/query-') ||
			req.path.includes('/save-')
		) {
			return res.status(401).json({
				success: false,
				error: 'No autenticado. Por favor inicia sesión.',
				redirect: '/',
			})
		}
		// Para peticiones normales, redirigir al login
		return res.redirect('/')
	}
	next()
}

module.exports = requireLogin
