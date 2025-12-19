# Synway Gateway API Endpoints

Documentación basada en el manual **SMG Wireless Gateway API v1.8.0**

## 🔐 Autenticación

Todas las peticiones requieren autenticación HTTP Basic usando:

- **Usuario**: Configurado en el gateway (por defecto: `ApiUserAdmin`)
- **Contraseña**: Configurada en el gateway

## 📡 Endpoints Base

### 1. TaskHandle - Ejecutar Tareas

```
POST http://{GATEWAY_IP}/API/TaskHandle
Content-Type: application/json
```

**Usado para:**

- Enviar SMS
- Enviar USSD
- Eliminar mensajes

---

### 2. QueryInfo - Consultar Información

```
POST http://{GATEWAY_IP}/API/QueryInfo
Content-Type: application/json
```

**Usado para:**

- Consultar estado de puertos
- Consultar resultados de envío
- Obtener información del dispositivo
- Consultar mensajes recibidos

---

## 📨 SMS Operations

### Enviar SMS

**Endpoint:** `/API/TaskHandle`

```json
{
	"event": "txsms",
	"userid": "0",
	"num": "1234567890",
	"port": "-1",
	"encoding": "0",
	"smsinfo": "Hello World!"
}
```

**Parámetros:**

- `event`: `"txsms"` (requerido)
- `userid`: ID de usuario para tracking (opcional, default: "0")
- `num`: Número(s) de destino, separados por coma (requerido)
- `port`: Puerto a usar: "-1" auto, o "1,2,3" específico (default: "-1")
- `encoding`: "0" para ASCII (bit7), "8" para Unicode (UCS-2)
- `smsinfo`: Contenido del mensaje (max 600 chars para bit7, 300 para UCS-2)

**Respuesta exitosa:**

```json
{
	"result": "ok",
	"content": "taskid:123"
}
```

**Respuesta error:**

```json
{
	"result": "error",
	"content": "error reason"
}
```

---

### Consultar Resultado de Envío

**Endpoint:** `/API/QueryInfo`

```json
{
	"event": "querytxsms",
	"taskid": "123"
}
```

**Parámetros:**

- `event`: `"querytxsms"` (requerido)
- `taskid`: ID de tarea a consultar, separados por coma (requerido)
- `num`: Número específico a consultar (opcional)
- `port`: Puerto específico a consultar (opcional)

---

### Obtener Mensajes Recibidos (Inbox)

**Endpoint:** `/API/QueryInfo`

```json
{
	"event": "queryrxsms",
	"begintime": "20231219180000",
	"endtime": "20231219190000",
	"port": "1,2",
	"phonenum": "1234567890"
}
```

---

### Obtener Mensajes Enviados (Outbox)

**Endpoint:** `/API/QueryInfo`

```json
{
	"event": "querysxsms",
	"begintime": "20231219180000",
	"endtime": "20231219190000",
	"port": "1,2",
	"phonenum": "1234567890"
}
```

---

### Eliminar Mensajes

**Endpoint:** `/API/TaskHandle`

```json
{
	"event": "deletesms",
	"port": "1,2",
	"phonenum": "1234567890",
	"begintime": "20231219180000",
	"endtime": "20231219190000"
}
```

---

## 📊 Device Information

### Obtener Estado de Puertos

**Endpoint:** `/API/QueryInfo`

```json
{
	"event": "getportinfo"
}
```

**Respuesta:**

```json
{
	"result": "ok",
	"content": "total:8;portstate:0,0,0,0,0,0,0,0"
}
```

**Estados de Puerto:**

- `0` - Idle (Inactivo)
- `1` - Off-hook
- `2` - Ringing (Timbrando)
- `3` - Talking (En llamada)
- `4,5,6` - Dialing (Marcando)
- `7` - Pending (Pendiente)
- `9` - Ringback
- `10` - Interior
- `11` - Unavailable (No disponible)

---

### Obtener Estado de Conexión BS

**Endpoint:** `/API/QueryInfo`

```json
{
	"event": "getportconnectstate"
}
```

**Respuesta:**

```json
{
	"result": "ok",
	"content": "total:8;ConnectState:1,1,1,1,0,0,0,0"
}
```

**Estados de Conexión:**

- `0` - Unconnected (Desconectado)
- `1` - Connected (Conectado)
- `2` - Connecting (Conectando)
- `3` - Rejected (Rechazado)
- `4` - Unknown (Desconocido)
- `5` - Roaming (Roaming)

---

### Obtener Información Inalámbrica

**Endpoint:** `/API/QueryInfo`

```json
{
	"event": "getwirelessinfo",
	"type": "IMEI",
	"port": "0,1,2"
}
```

**Parámetros:**

- `event`: `"getwirelessinfo"` (requerido)
- `type`: Tipo de consulta (requerido)
  - `"porttype"` - Tipo de puerto (GSM/WCDMA/LTE)
  - `"ICCID"` - Número de tarjeta SIM
  - `"IMEI"` - Identificador del equipo
  - `"IMSI"` - Identificador del suscriptor
  - `"PhoneNo"` - Número de teléfono
- `port`: Puertos a consultar, separados por coma (opcional - sin especificar consulta todos)

**Ejemplo respuesta:**

```json
{
	"result": "ok",
	"content": "2:89860058111551226470.3:89860058111551226471."
}
```

---

## 🔄 USSD Operations

### Enviar USSD

**Endpoint:** `/API/TaskHandle`

```json
{
	"event": "txussd"
}
```

---

### Consultar Resultado USSD

**Endpoint:** `/API/QueryInfo`

```json
{
	"event": "queryussd"
}
```

---

### Eliminar USSD

**Endpoint:** `/API/TaskHandle`

```json
{
	"event": "deleteussd"
}
```

---

## 📝 Formato de Fecha/Hora

Todas las fechas deben estar en formato: `YYYYMMDDHHmmss`

**Ejemplo:** `20231219180000` = 19 de diciembre de 2023, 18:00:00

---

## ⚠️ Notas Importantes

1. **Codificación de mensajes:**

   - ASCII (bit7): Máximo 600 caracteres
   - Unicode (UCS-2): Máximo 300 caracteres

2. **Números múltiples:**

   - Separar con comas: `"10086,10087,10088"`
   - Hasta 50 números por solicitud

3. **Selección de puerto:**

   - `"-1"` = Selección automática
   - `"1,2,3"` = Usar puertos específicos
   - El gateway selecciona puertos inactivos automáticamente

4. **Formato de respuesta:**
   - Éxito: `{"result":"ok","content":"..."}`
   - Error: `{"result":"error","content":"error reason"}`
