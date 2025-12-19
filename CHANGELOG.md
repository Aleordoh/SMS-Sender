# Cambios Realizados en SMS-Sender

## 📅 Fecha: 19 de diciembre de 2025

### 🔧 Correcciones de Endpoints API

#### Archivo: `services/synwayGateway.js`

**ANTES (Incorrecto):**

```javascript
// Formato incorrecto - no basado en la documentación oficial
const data = {
	op: 'SmsSend',
	username: this.username,
	password: this.password,
	dst: phoneNumber,
	msg: message,
}
// Enviado como application/x-www-form-urlencoded
```

**AHORA (Correcto según API v1.8.0):**

```javascript
// Formato correcto según SMG Wireless Gateway API v1.8.0
const data = {
	event: 'txsms',
	userid: '0',
	num: phoneNumber,
	port: '-1',
	encoding: '0', // Auto-detectado (0=ASCII, 8=Unicode)
	smsinfo: message,
}
// Enviado como application/json con HTTP Basic Auth
```

### ✨ Nuevas Funcionalidades

1. **Detección automática de codificación**

   - Detecta si el mensaje contiene caracteres Unicode
   - Usa encoding="0" (ASCII/bit7) para mensajes simples
   - Usa encoding="8" (UCS-2) para mensajes con caracteres especiales/emojis

2. **Extracción de Task ID**

   - Extrae el Task ID de la respuesta del gateway
   - Permite hacer seguimiento del envío con `querySMSResult()`

3. **Nuevos métodos de consulta:**

   - `querySMSResult(taskid)` - Consultar resultado de envío
   - `getPortStatus()` - Obtener estado de puertos
   - `getPortConnectionStatus()` - Obtener estado de conexión BS
   - `getWirelessInfo(type, port)` - Obtener información inalámbrica (IMEI, ICCID, etc.)

4. **Autenticación mejorada:**
   - Usa HTTP Basic Authentication en lugar de parámetros en el body
   - Más seguro y alineado con la especificación de la API

### 📚 Nueva Documentación

1. **API_ENDPOINTS.md**

   - Documentación completa de todos los endpoints
   - Ejemplos de uso para cada operación
   - Descripción de parámetros y respuestas
   - Basado en el manual oficial v1.8.0

2. **test_gateway.js**

   - Script de prueba para verificar conectividad
   - Prueba múltiples operaciones de la API
   - Útil para diagnosticar problemas de conexión

3. **README.md actualizado**
   - Información actualizada sobre endpoints
   - Referencias a la nueva documentación
   - Ejemplos de uso actualizados

### 🎯 Endpoints Disponibles

#### TaskHandle (`/API/TaskHandle`)

- ✅ Enviar SMS (`event: "txsms"`)
- ⚠️ Enviar USSD (`event: "txussd"`) - Implementación básica
- ⚠️ Eliminar SMS (`event: "deletesms"`) - No implementado en clase

#### QueryInfo (`/API/QueryInfo`)

- ✅ Consultar resultado de envío (`event: "querytxsms"`)
- ✅ Obtener estado de puertos (`event: "getportinfo"`)
- ✅ Obtener estado de conexión (`event: "getportconnectstate"`)
- ✅ Obtener información inalámbrica (`event: "getwirelessinfo"`)
- ⚠️ Consultar mensajes recibidos (`event: "queryrxsms"`) - No implementado
- ⚠️ Consultar mensajes enviados (`event: "querysxsms"`) - No implementado

### 🧪 Cómo Probar

```bash
# Configurar credenciales
export GATEWAY_HOST="192.168.1.45"
export GATEWAY_USERNAME="ApiUserAdmin"
export GATEWAY_PASSWORD="acuerdo1234"

# Probar conectividad (sin enviar SMS)
npm test

# Probar envío de SMS
export TEST_PHONE="1234567890"
npm run test:sms
```

### ⚠️ Cambios Importantes

1. **Content-Type cambiado:**

   - Antes: `application/x-www-form-urlencoded`
   - Ahora: `application/json`

2. **Estructura de datos:**

   - Usar `event` en lugar de `op`
   - Usar `num` en lugar de `dst`
   - Usar `smsinfo` en lugar de `msg`
   - Agregar parámetros adicionales: `userid`, `port`, `encoding`

3. **Autenticación:**
   - Antes: Credenciales en el body
   - Ahora: HTTP Basic Authentication header

### 📖 Referencias

- Manual oficial: `manual/SMG_Wireless_Gateway_APIv1.8.0.pdf`
- Documentación de endpoints: `API_ENDPOINTS.md`
- Script de prueba: `test_gateway.js`

### ✅ Compatibilidad

Estos cambios están basados en el **manual oficial SMG Wireless Gateway API v1.8.0** incluido en el proyecto, asegurando compatibilidad completa con el gateway Synway SMG4008-8WA.
