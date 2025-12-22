const users = require('../config/users.js')
const controller = {
	login: (req, res) => {
		res.render('login', { title: 'Login', error: null })
	},
	loginProcess: (req, res) => {
		//return res.send('Procesando login...')
		const { username, password } = req.body
		const user = users.users.find(
			(u) => u.username === username && u.password === password
		)
		if (user) {
			// Successful login
			req.session.user = user
			res.redirect('/sms')
		} else {
			// Failed login
			res.render('login', {
				title: 'Login',
				error: 'Usuario o contraseña incorrectos',
			})
		}
	},
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Error al cerrar sesión');
      }
      res.redirect('/');
    });
  }
}
module.exports = controller
