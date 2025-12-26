# SMS-Sender: AI Coding Agent Instructions

## Project Overview

SMS-Sender is an Express.js web application for **bulk SMS sending** via Synway SMG4008-8WA Gateway. The system accepts CSV/XLSX files with recipient data, validates contents, and sends SMS messages with configurable delays to prevent gateway saturation.

**Key Architecture:**

- **Express.js** server with EJS templates, session-based authentication
- **Three-layer pattern**: Routes → Controllers → Services
- **Services**: `FileParser` (CSV/XLSX handling), `SynwayGateway` (HTTP API client)
- **File validation** before transmission, **delay control** between SMS sends

## Critical Workflows

### 1. File Upload → SMS Send Flow

```
POST /sms/send → smsController.processUpload()
  ├─ Parse file (FileParser.parseFile) → normalize to [{phone, message}]
  ├─ Validate recipients (FileParser.validateRecipients)
  └─ Send each SMS with delay: SynwayGateway.sendSMS(phone, message)
```

### 2. Configuration Management

- **Gateway settings** come from environment variables (see `.env.example`):
  - `GATEWAY_HOST`, `GATEWAY_PORT`, `GATEWAY_PROTOCOL` (http/https)
  - `GATEWAY_USERNAME`, `GATEWAY_PASSWORD` (HTTP Basic Auth)
  - `SMS_DELAY` (milliseconds between sends, default 6000ms)
- Login system: session-based in `middlewares/loginMiddleware.js`

### 3. File Parser Behavior

- **Column detection** is case-insensitive and locale-aware:
  - Phone: `phone|telephone|number|telefono` (Spanish/English)
  - Message: `message|text|sms|mensaje`
- **CSV separator auto-detection**: Counts `;` vs `,` and picks the more frequent
- **Phone cleaning**: Removes spaces, dashes, parentheses; strips leading `+` or `00`
- **Validation**: Enforces 8+ digit phones, non-empty messages, max 160 chars/message

## Code Patterns & Conventions

### File Organization

- **Services** (`services/`): Stateless, reusable logic (e.g., `SynwayGateway`, `FileParser`)
- **Controllers** (`controllers/`): Request handling, orchestration (e.g., `smsController`)
- **Middlewares** (`middlewares/`): Auth, rate-limiting, upload handling
- **Routes** (`routes/`): Express route definitions only
- **Views** (`views/`): EJS templates with separate CSS files (`public/css/`)

### Key Implementation Details

#### SynwayGateway HTTP API

- **Endpoint**: `POST http://<GATEWAY_IP>/API/TaskHandle`
- **Request format** (Synway API v1.8.0):
  ```json
  {
  	"event": "txsms",
  	"userid": "0",
  	"num": "phonenumber",
  	"port": "-1",
  	"encoding": 0,
  	"smsinfo": "message text"
  }
  ```
- **Encoding logic**: `detectEncoding(message)` → 0 for ASCII, 8 for Unicode
- **Authentication**: HTTP Basic Auth with username/password
- **Response handling**: Expects `{"result":"ok","content":"taskid:X"}` or error

#### FileParser Multi-Format Support

- **XLSX**: Uses `xlsx` library; reads first sheet automatically
- **CSV**: Uses `csv-parser` with auto-detected separator (`;` or `,`)
- **Error handling**: File validation throws detailed errors by row number
- **Phone normalization**: `cleanPhoneNumber()` removes formatting, returns string

### Critical Behaviors

1. **SMS delay enforcement**: Controller adds delays between sends to prevent gateway overload
2. **Session secret**: Hardcoded in `app.js` (`'qeaQltMMiwqAWt07'`) - consider env variable for production
3. **File cleanup**: Failed validations delete temp files immediately
4. **SSRF protection**: `SynwayGateway.validateHost()` blocks `://` in host strings
5. **Multer integration**: Handles file uploads in `routes/sms.Routes.js` with middleware

## Pre-Task Checklist (ALWAYS DO THIS)

**Before processing ANY request:**

1. Read `README.md` to understand current project state
2. Review `manual/` documentation:
   - **Gateway manual**: Hardware configuration, API endpoints, response formats
   - **API documentation**: Synway SMG4008-8WA HTTP API specifications
3. Check current codebase state in relevant files

**After completing ANY modification:**

1. Update `README.md` with changes made
2. Update version/changelog if applicable
3. Ensure documentation reflects new features or API changes

## Development Commands

```bash
npm start          # Run server (port 3000 default)
npm run dev        # Run with nodemon (auto-reload on file changes)
npm test           # Run test_gateway.js (requires TEST_PHONE env var)
npm run test:sms   # Run TEST_PHONE=$PHONE node test_gateway.js
```

## Integration Points & Dependencies

| Service         | Purpose                         | Config                                 |
| --------------- | ------------------------------- | -------------------------------------- |
| axios           | HTTP requests to Synway Gateway | No special config needed               |
| express-session | Session authentication          | Secret in app.js, 24h cookie           |
| multer          | File upload handling            | Configured in routes, stores in temp   |
| csv-parser      | CSV parsing                     | Auto-separator detection in FileParser |
| xlsx            | Excel file parsing              | Reads first sheet only                 |

## Documentation References

### Gateway & API Documentation

- **Location**: `manual/` directory
- **Contains**:
  - Synway SMG4008-8WA gateway hardware manual
  - HTTP API endpoint specifications (v1.8.0+)
  - Response format documentation
  - Port configuration options
- **Critical for**: Gateway modifications, endpoint changes, compatibility updates

### Project Documentation

- **README.md**: User-facing features, installation, usage guide
  - MUST update after ANY feature changes or behavior modifications
  - Keep command examples and setup instructions current
- **.github/copilot-instructions.md**: This file - developer guidance for AI agents

## Common Issues & Gotchas

1. **Gateway connection errors**: Check `GATEWAY_HOST`, `GATEWAY_PORT`, credentials match actual gateway config
2. **Message encoding**: Long messages (>160 chars) fail validation; Unicode (8-bit) and ASCII (7-bit) handled automatically
3. **Phone validation**: Requires 8+ digits after formatting; leading +/00 stripped
4. **File column names**: Must be exact matches (case-sensitive in current implementation) - future improvement: implement fuzzy matching
5. **Permissions issue**: Directory/file permissions (e.g., `dr-xr-xr-x`) block git operations; use `chmod -R u+w` to fix

## When Modifying...

- **Adding SMS features**: Work in `smsController.js` → extend `SynwayGateway` methods
- **Supporting new file formats**: Add logic to `FileParser.parseFile()` and `normalizeData()`
- **Changing validation rules**: Edit `FileParser.validateRecipients()` (phone length, message length)
- **Adding authentication methods**: Extend `loginMiddleware.js` and session config in `app.js`
- **Gateway API updates**: Modify `SynwayGateway` constructor, request/response parsing in `sendSMS()`

---

**Last Updated**: 2025-12-26 | **Project Version**: 1.0.0
