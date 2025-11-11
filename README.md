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

1. **Credenciales**: Mantén las credenciales del gateway seguras. Usa variables de entorno en producción.
2. **HTTPS**: Usa HTTPS en producción para proteger las credenciales en tránsito.
3. **Autenticación**: Implementa autenticación y autorización según tus necesidades.
4. **Archivos temporales**: Los archivos subidos se eliminan automáticamente después del procesamiento.
5. **Validación**: El sistema valida números de teléfono y mensajes antes de enviar.
6. **Rate Limiting**: Incluye limitación de tasa para prevenir abuso:
   - 10 solicitudes de envío por IP cada 15 minutos
   - 20 pruebas de conexión por IP cada 5 minutos
7. **Gateway URL**: La URL del gateway es validada para prevenir ataques SSRF.
8. **Archivos confiables**: Solo acepta archivos CSV/XLSX de fuentes confiables (máx 5MB).

### Vulnerabilidades Conocidas

- La librería `xlsx` (v0.18.5) tiene vulnerabilidades conocidas:
  - **Prototype Pollution** (CVE pendiente)
  - **ReDoS** (Regular Expression Denial of Service)
  - **Mitigación**: Solo procesa archivos de fuentes confiables. Valida el tamaño (máx 5MB).
  - **Alternativa**: Considera actualizar a una versión parcheada cuando esté disponible o usar una librería alternativa.

## Limitaciones conocidas

- Los mensajes están limitados a 160 caracteres (estándar SMS)
- El sistema procesa los SMS de forma secuencial para evitar saturar el gateway
- El gateway debe ser accesible desde el servidor donde se ejecuta la aplicación

## Licencia

ISC

## Autor

Martin Orodoñéz

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request en GitHub.

## Soporte

Para problemas o preguntas, abre un issue en: https://github.com/Aleordoh/SMS-Sender/issues
