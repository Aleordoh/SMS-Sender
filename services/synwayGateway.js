const axios = require('axios');

/**
 * Synway SMG4008-8WA Gateway HTTP API Client
 * Based on Synway Gateway HTTP API documentation
 */
class SynwayGateway {
    constructor(config) {
        this.host = config.host || 'localhost';
        this.port = config.port || 80;
        this.username = config.username || 'admin';
        this.password = config.password || 'admin';
        
        // Validate host to prevent SSRF
        this.validateHost(this.host);
        
        this.baseUrl = `http://${this.host}:${this.port}`;
    }

    /**
     * Validate host to prevent SSRF attacks
     * Allows: IP addresses, hostnames, but blocks dangerous protocols
     */
    validateHost(host) {
        // Block file:// and other dangerous protocols
        if (host.includes('://')) {
            throw new Error('Invalid host: protocol not allowed in host configuration');
        }
        
        // Basic validation - should not be empty
        if (!host || host.trim().length === 0) {
            throw new Error('Host cannot be empty');
        }
    }

    /**
     * Send SMS using HTTP API
     * According to Synway documentation, the HTTP API format is:
     * http://ip:port/sendSMS?username=xxx&password=xxx&to=phonenumber&text=message
     */
    async sendSMS(phoneNumber, message) {
        try {
            const params = {
                username: this.username,
                password: this.password,
                to: phoneNumber,
                text: encodeURIComponent(message)
            };

            const url = `${this.baseUrl}/sendSMS`;
            const response = await axios.get(url, { 
                params,
                timeout: 30000 
            });

            return {
                success: true,
                data: response.data,
                status: response.status
            };
        } catch (error) {
            console.error(`Error sending SMS to ${phoneNumber}:`, error.message);
            return {
                success: false,
                error: error.message,
                phoneNumber: phoneNumber
            };
        }
    }

    /**
     * Send multiple SMS messages
     */
    async sendBulkSMS(recipients) {
        const results = [];
        
        for (const recipient of recipients) {
            const result = await this.sendSMS(recipient.phone, recipient.message);
            results.push({
                phone: recipient.phone,
                message: recipient.message,
                ...result
            });
            
            // Small delay between messages to avoid overwhelming the gateway
            await this.delay(100);
        }

        return results;
    }

    /**
     * Check gateway status
     */
    async checkStatus() {
        try {
            const response = await axios.get(`${this.baseUrl}/status`, {
                auth: {
                    username: this.username,
                    password: this.password
                },
                timeout: 5000
            });

            return {
                success: true,
                status: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = SynwayGateway;
