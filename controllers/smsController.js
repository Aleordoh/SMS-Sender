const SynwayGateway = require('../services/synwayGateway');
const FileParser = require('../services/fileParser');
const fs = require('fs');

/**
 * SMS Controller
 * Handles SMS sending operations
 */
class SMSController {
    /**
     * Show upload form
     */
    static showUploadForm(req, res) {
        res.render('upload', {
            title: 'SMS Sender - Synway Gateway',
            error: null,
            success: null
        });
    }

    /**
     * Process file upload and send SMS
     */
    static async processUpload(req, res) {
        try {
            // Check if file was uploaded
            if (!req.file) {
                return res.render('upload', {
                    title: 'SMS Sender - Synway Gateway',
                    error: 'Please select a file to upload',
                    success: null
                });
            }

            // Parse the uploaded file
            const recipients = await FileParser.parseFile(req.file.path);

            // Validate recipients
            const validation = FileParser.validateRecipients(recipients);
            if (!validation.isValid) {
                // Clean up uploaded file
                fs.unlinkSync(req.file.path);
                
                return res.render('upload', {
                    title: 'SMS Sender - Synway Gateway',
                    error: `File validation failed:\n${validation.errors.join('\n')}`,
                    success: null
                });
            }

            // Get gateway configuration from environment or request
            const gatewayConfig = {
                host: req.body.gateway_host || process.env.GATEWAY_HOST || 'localhost',
                port: req.body.gateway_port || process.env.GATEWAY_PORT || 80,
                username: req.body.gateway_username || process.env.GATEWAY_USERNAME || 'admin',
                password: req.body.gateway_password || process.env.GATEWAY_PASSWORD || 'admin'
            };

            const gateway = new SynwayGateway(gatewayConfig);

            // Send SMS messages
            const results = await gateway.sendBulkSMS(recipients);

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);

            // Render results
            res.render('results', {
                title: 'SMS Sending Results',
                results: results,
                totalSent: results.filter(r => r.success).length,
                totalFailed: results.filter(r => !r.success).length,
                total: results.length
            });

        } catch (error) {
            console.error('Error processing upload:', error);
            
            // Clean up uploaded file if it exists
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.render('upload', {
                title: 'SMS Sender - Synway Gateway',
                error: `Error: ${error.message}`,
                success: null
            });
        }
    }

    /**
     * Show configuration page
     */
    static showConfig(req, res) {
        res.render('config', {
            title: 'Gateway Configuration',
            config: {
                host: process.env.GATEWAY_HOST || 'localhost',
                port: process.env.GATEWAY_PORT || 80,
                username: process.env.GATEWAY_USERNAME || 'admin'
            }
        });
    }

    /**
     * Test gateway connection
     */
    static async testConnection(req, res) {
        try {
            const gatewayConfig = {
                host: req.body.gateway_host || process.env.GATEWAY_HOST || 'localhost',
                port: req.body.gateway_port || process.env.GATEWAY_PORT || 80,
                username: req.body.gateway_username || process.env.GATEWAY_USERNAME || 'admin',
                password: req.body.gateway_password || process.env.GATEWAY_PASSWORD || 'admin'
            };

            const gateway = new SynwayGateway(gatewayConfig);
            const status = await gateway.checkStatus();

            res.json({
                success: status.success,
                message: status.success ? 'Connection successful' : `Connection failed: ${status.error}`,
                status: status.status
            });
        } catch (error) {
            res.json({
                success: false,
                message: `Error: ${error.message}`
            });
        }
    }
}

module.exports = SMSController;
