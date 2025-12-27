window.addEventListener('load', () => {
	document.getElementById('testForm').addEventListener('submit', async (e) => {
		e.preventDefault()

		const resultDiv = document.getElementById('testResult')
		resultDiv.style.display = 'block'
		resultDiv.className = ''
		resultDiv.textContent = 'Probando conexión...'

		const formData = new FormData(e.target)
		const data = Object.fromEntries(formData.entries())

		try {
			const response = await fetch('/sms/test-connection', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			const result = await response.json()

			if (result.success) {
				resultDiv.className = 'success'
				resultDiv.textContent = '✓ ' + result.message
			} else {
				resultDiv.className = 'error'
				resultDiv.textContent = '✗ ' + result.message
			}
		} catch (error) {
			resultDiv.className = 'error'
			resultDiv.textContent = '✗ Error al probar la conexión: ' + error.message
		}
	})

	// Port configuration form handler
	document.getElementById('portConfigForm').addEventListener('submit', async (e) => {
		e.preventDefault()

		const resultDiv = document.getElementById('portConfigResult')
		resultDiv.style.display = 'block'
		resultDiv.className = ''
		resultDiv.textContent = 'Guardando configuración...'

		const formData = new FormData(e.target)
		const data = Object.fromEntries(formData.entries())

		try {
			const response = await fetch('/sms/save-port-config', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			const result = await response.json()

			if (result.success) {
				resultDiv.className = 'success'
				resultDiv.textContent = '✓ ' + result.message
				// Update the current port count display
				document.getElementById('currentPortCount').textContent = result.portCount + ' puertos'
			} else {
				resultDiv.className = 'error'
				resultDiv.textContent = '✗ ' + result.message
			}
		} catch (error) {
			resultDiv.className = 'error'
			resultDiv.textContent = '✗ Error al guardar la configuración: ' + error.message
		}
	})
})
