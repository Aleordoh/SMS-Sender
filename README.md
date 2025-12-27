# SMS Sender - Synway SMG4008-8WA Gateway

Sistema de envío masivo de SMS para el Gateway Synway SMG4008-8WA utilizando Express.js y EJS templates.

## Características

- 📤 Envío masivo de SMS a través del Gateway Synway SMG4008-8WA
- 📁 Soporte para archivos XLSX y CSV
- 🎨 Interfaz web moderna con EJS templates y CSS separados
- ⚙️ Configuración flexible del gateway
- 🔄 **Distribución secuencial de mensajes entre puertos GSM** (configurable de 1 a 8 puertos)
- ⏱️ **Delay configurable entre envíos** para evitar saturar el gateway
- 📊 Resultados detallados del envío con puerto utilizado
- 📨 **Consulta de respuestas SMS recibidas**
- 📥 **Descarga de respuestas en formato CSV**
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
SMS_DELAY=6000
SMS_PORT_COUNT=4
PORT=3000
```

Ver `.env.example` para todas las opciones disponibles.

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
| phone | message |
|------------|----------------------------------|
| 1234567890 | Hola! Este es un mensaje de prueba |
| 9876543210 | Bienvenido a nuestro servicio |

Ver archivo de ejemplo en `examples/sample.csv`

### Enviar SMS

1. Acceder a `http://localhost:3000`
2. Configurar los datos del Gateway (host, puerto, usuario, contraseña)
3. Seleccionar el archivo CSV o XLSX
4. Hacer clic en "Enviar SMS Masivos"
5. Ver los resultados del envío

### Configurar distribución de puertos GSM

El sistema permite configurar cuántos puertos GSM usar para el envío secuencial de mensajes:

1. Ir a `http://localhost:3000/sms/config` o `http://localhost:3000/sms/inbox`
2. Seleccionar el número de puertos a utilizar (1-8)
3. Los mensajes se distribuirán secuencialmente entre los puertos configurados

**Ejemplo con 4 puertos:**
- Mensaje 1 → Puerto 1
- Mensaje 2 → Puerto 2
- Mensaje 3 → Puerto 3
- Mensaje 4 → Puerto 4
- Mensaje 5 → Puerto 1 (reinicia el ciclo)
- Mensaje 6 → Puerto 2
- ...y así sucesivamente

**Ventajas:**
- ✅ Distribución equitativa de carga entre puertos
- ✅ Evita saturación de un solo puerto
- ✅ Mejor rendimiento y confiabilidad
- ✅ Visible en resultados qué puerto usó cada mensaje

### Probar conexión

Puedes probar la conexión con el gateway en la sección de configuración:

1. Ir a `http://localhost:3000/sms/config`
2. Ingresar los datos del gateway
3. Ajustar el delay entre envíos (recomendado: 6000ms / 6 segundos)
4. Hacer clic en "Probar Conexión"

### Consultar respuestas SMS

Después de enviar SMS, puedes consultar las respuestas recibidas:

1. En la página de resultados, desplázate a "📨 Consultar Respuestas SMS"
2. Selecciona el período de tiempo (últimas 1, 3, 6, 12 o 24 horas)
3. Haz clic en "🔍 Consultar Respuestas"
4. Si hay respuestas, puedes descargarlas en formato CSV con el botón "📥 Descargar Respuestas (CSV)"

**Nota:** Esta funcionalidad consulta directamente el gateway Synway para obtener los SMS recibidos.

## API del Gateway Synway

El sistema utiliza la **API HTTP v1.8.0** del Gateway Synway SMG4008-8WA:

### Endpoints principales:

**1. Enviar SMS** - `POST http://[host]:[port]/API/TaskHandle`

```json
{
	"event": "txsms",
	"userid": "0",
	"num": "1234567890",
	"port": "1",
	"encoding": "0",
	"smsinfo": "Hola Mundo!"
}
```

**Parámetro `port`:**
- `-1`: El gateway selecciona automáticamente el puerto (comportamiento anterior)
- `"1"`, `"2"`, ... `"8"`: Usa un puerto específico
- El sistema ahora usa distribución secuencial automática basada en la configuración

**2. Consultar información** - `POST http://[host]:[port]/API/QueryInfo`

```json
{
	"event": "getportinfo"
}
```

**3. Consultar SMS recibidos** - `POST http://[host]:[port]/API/QueryInfo`

```json
{
	"event": "queryrxsms",
	"begintime": "20231219180000",
	"endtime": "20231219190000",
	"port": "-1"
}
```

### Autenticación:

- **Método**: HTTP Basic Authentication
- **Usuario**: Configurado en el gateway (default: `ApiUserAdmin`)
- **Contraseña**: Configurada en el gateway

### Documentación completa:

- Ver [API_ENDPOINTS.md](API_ENDPOINTS.md) para documentación detallada de todos los endpoints
- Manual oficial incluido en: `manual/SMG_Wireless_Gateway_APIv1.8.0.pdf`

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
│   ├── results.ejs            # Vista de resultados con consulta de respuestas
│   └── config.ejs             # Vista de configuración
├── public/
│   ├── css/
│   │   ├── main.css           # Estilos principales
│   │   └── results.css        # Estilos de resultados
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
- El sistema procesa los SMS de forma secuencial con un delay configurable (por defecto 6000ms / 6 segundos)
- El gateway debe ser accesible desde el servidor donde se ejecuta la aplicación
- El formato de las respuestas SMS recibidas puede variar según la configuración del gateway

## Actualizaciones Recientes

Ver [UPDATES.md](UPDATES.md) para un resumen detallado de las últimas actualizaciones implementadas.

## Licencia

ISC

## Autor

Martin Orodoñéz

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request en GitHub.

## Soporte

Para problemas o preguntas, abre un issue en: https://github.com/Aleordoh/SMS-Sender/issues
