const xlsx = require('xlsx');
const fs = require('fs');
const csv = require('csv-parser');

/**
 * File Parser Service
 * Handles parsing of XLSX and CSV files for SMS recipients
 */
class FileParser {
    /**
     * Parse file based on extension
     */
    static async parseFile(filePath) {
        const extension = filePath.split('.').pop().toLowerCase();
        
        if (extension === 'xlsx' || extension === 'xls') {
            return this.parseExcel(filePath);
        } else if (extension === 'csv') {
            return this.parseCSV(filePath);
        } else {
            throw new Error('Unsupported file format. Please use XLSX or CSV files.');
        }
    }

    /**
     * Parse Excel file (XLSX/XLS)
     * Expected columns: phone, message (or similar variations)
     */
    static parseExcel(filePath) {
        try {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet);

            return this.normalizeData(data);
        } catch (error) {
            throw new Error(`Error parsing Excel file: ${error.message}`);
        }
    }

    /**
     * Detect CSV separator by reading first line
     */
    static detectSeparator(filePath) {
        const firstLine = fs.readFileSync(filePath, 'utf-8').split('\n')[0];
        const semicolonCount = (firstLine.match(/;/g) || []).length;
        const commaCount = (firstLine.match(/,/g) || []).length;
        
        // Return separator with more occurrences
        return semicolonCount > commaCount ? ';' : ',';
    }

    /**
     * Parse CSV file
     */
    static parseCSV(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            const separator = this.detectSeparator(filePath);  // Detectar separador
            
            fs.createReadStream(filePath)
                .pipe(csv({ separator: separator }))
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    try {
                        const normalized = this.normalizeData(results);
                        resolve(normalized);
                    } catch (error) {
                        reject(error);
                    }
                })
                .on('error', (error) => {
                    reject(new Error(`Error parsing CSV file: ${error.message}`));
                });
        });
    }

    /**
     * Normalize data to ensure consistent field names
     * Looks for phone/telephone/number and message/text/sms fields
     */
    static normalizeData(data) {
        if (!data || data.length === 0) {
            throw new Error('File is empty or contains no data');
        }

        const phoneFields = ['phone', 'telephone', 'number', 'Phone', 'Telephone', 'Number', 'PHONE', 'TELEPHONE', 'NUMBER', 'telefono', 'Telefono', 'TELEFONO'];
        const messageFields = ['message', 'text', 'sms', 'Message', 'Text', 'SMS', 'MESSAGE', 'TEXT', 'mensaje', 'Mensaje', 'MENSAJE'];

        const sampleRow = data[0];
        const phoneField = phoneFields.find(field => field in sampleRow);
        const messageField = messageFields.find(field => field in sampleRow);

        if (!phoneField) {
            throw new Error('Could not find phone number column. Expected column names: phone, telephone, number, or similar');
        }

        if (!messageField) {
            throw new Error('Could not find message column. Expected column names: message, text, sms, or similar');
        }

        return data.map((row, index) => {
            const phone = this.cleanPhoneNumber(row[phoneField]);
            const message = row[messageField];

            if (!phone || !message) {
                throw new Error(`Row ${index + 1} is missing phone number or message`);
            }

            return {
                phone: phone,
                message: message.trim()
            };
        });
    }

    /**
     * Clean and validate phone number
     */
    static cleanPhoneNumber(phone) {
        if (!phone) return null;
        
        // Convert to string and remove common separators
        let cleaned = String(phone).replace(/[\s\-\(\)\.]/g, '');
        
        // Remove leading + or 00
        cleaned = cleaned.replace(/^(\+|00)/, '');
        
        return cleaned;
    }

    /**
     * Validate recipients array
     */
    static validateRecipients(recipients) {
        const errors = [];
        
        recipients.forEach((recipient, index) => {
            if (!recipient.phone || recipient.phone.length < 8) {
                errors.push(`Row ${index + 1}: Invalid phone number`);
            }
            if (!recipient.message || recipient.message.length === 0) {
                errors.push(`Row ${index + 1}: Message is empty`);
            }
            if (recipient.message && recipient.message.length > 160) {
                errors.push(`Row ${index + 1}: Message exceeds 160 characters`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = FileParser;
