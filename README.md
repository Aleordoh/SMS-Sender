# SMS Sender - Synway SMG4008-8WA Gateway

Sistema de envío masivo de SMS para el Gateway Synway SMG4008-8WA utilizando Express.js y EJS templates.

## Características

- 📤 Envío masivo de SMS a través del Gateway Synway SMG4008-8WA
- 📁 Soporte para archivos XLSX y CSV
- 🎨 Interfaz web moderna con EJS templates
- ⚙️ Configuración flexible del gateway
- 📊 Resultados detallados del envío
- ✅ Validación de números y mensajes

## Requisitos

- Node.js 12 o superior
- Gateway Synway SMG4008-8WA configurado y accesible en red
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Aleordoh/SMS-Sender.git
cd SMS-Sender
```

2. Instalar dependencias:
```bash
npm install
```

3. (Opcional) Configurar variables de entorno en un archivo `.env`:
```env
GATEWAY_HOST=192.168.1.100
GATEWAY_PORT=80
GATEWAY_USERNAME=admin
GATEWAY_PASSWORD=admin
PORT=3000
```

## Uso

### Iniciar el servidor

```bash
node app.js
```

O con npm:
```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`

### Preparar archivo de datos

Crea un archivo CSV o XLSX con las siguientes columnas:

**Columnas requeridas:**
- `phone` (o `telephone`, `number`, `telefono`): Número de teléfono del destinatario
- `message` (o `text`, `sms`, `mensaje`): Mensaje a enviar

**Ejemplo CSV:**
```csv
phone,message
1234567890,Hola! Este es un mensaje de prueba
9876543210,Bienvenido a nuestro servicio
```

**Ejemplo XLSX:**
| phone      | message                          |
|------------|----------------------------------|
| 1234567890 | Hola! Este es un mensaje de prueba |
| 9876543210 | Bienvenido a nuestro servicio    |

Ver archivo de ejemplo en `examples/sample.csv`

### Enviar SMS

1. Acceder a `http://localhost:3000`
2. Configurar los datos del Gateway (host, puerto, usuario, contraseña)
3. Seleccionar el archivo CSV o XLSX
4. Hacer clic en "Enviar SMS Masivos"
5. Ver los resultados del envío

### Probar conexión

Puedes probar la conexión con el gateway en la sección de configuración:
1. Ir a `http://localhost:3000/sms/config`
2. Ingresar los datos del gateway
3. Hacer clic en "Probar Conexión"

## API del Gateway Synway

El sistema utiliza la API HTTP del Gateway Synway SMG4008-8WA:

**Endpoint:** `http://[host]:[port]/sendSMS`

**Parámetros:**
- `username`: Usuario del gateway
- `password`: Contraseña del gateway
- `to`: Número de teléfono destino
- `text`: Mensaje a enviar (URL encoded)

**Documentación oficial:** [Manual Synway SMG4008-8WA](https://www.synway.net/Download/Manual/UserManual/SMG_Wireless_Gateway_ManualV2.2.0.pdf)

## Estructura del proyecto

```
SMS-Sender/
├── app.js                      # Aplicación principal Express
├── package.json                # Dependencias del proyecto
├── controllers/
│   └── smsController.js        # Controlador de SMS
├── services/
│   ├── synwayGateway.js       # Cliente API Synway
│   └── fileParser.js          # Parser de archivos CSV/XLSX
├── routes/
│   └── sms.js                 # Rutas de la aplicación
├── views/
│   ├── upload.ejs             # Vista de carga de archivos
│   ├── results.ejs            # Vista de resultados
│   └── config.ejs             # Vista de configuración
├── public/
│   └── uploads/               # Directorio temporal de archivos
└── examples/
    └── sample.csv             # Archivo de ejemplo
```

## Seguridad

⚠️ **Importante:**

1. Mantén las credenciales del gateway seguras
2. Usa HTTPS en producción
3. Implementa autenticación y autorización según tus necesidades
4. Los archivos subidos se eliminan automáticamente después del procesamiento
5. Valida siempre los números de teléfono y mensajes antes de enviar

## Limitaciones conocidas

- La librería `xlsx` tiene vulnerabilidades conocidas (Prototype Pollution y ReDoS). Usa solo con archivos confiables.
- Los mensajes están limitados a 160 caracteres (estándar SMS)
- El sistema procesa los SMS de forma secuencial para evitar saturar el gateway

## Licencia

ISC

## Autor

Martin Orodoñéz

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request en GitHub.

## Soporte

Para problemas o preguntas, abre un issue en: https://github.com/Aleordoh/SMS-Sender/issues
