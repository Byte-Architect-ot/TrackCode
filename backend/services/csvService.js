/**
 * Generate CSV string from array of objects
 * @param {Array<Object>} data - Array of objects to convert
 * @returns {string} CSV formatted string
 */
const generateCSV = (data) => {
    if (!data || data.length === 0) {
        return '';
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    const headerRow = headers.map(h => `"${h}"`).join(',');
    
    // Create data rows
    const dataRows = data.map(row => {
        return headers.map(header => {
            let value = row[header];
            
            // Handle null/undefined
            if (value === null || value === undefined) {
                value = '';
            }
            
            // Convert to string
            value = String(value);
            
            // Escape quotes and wrap in quotes
            value = value.replace(/"/g, '""');
            return `"${value}"`;
        }).join(',');
    });
    
    return [headerRow, ...dataRows].join('\n');
};

/**
 * Parse CSV string to array of objects
 * @param {string} csvString - CSV formatted string
 * @returns {Array<Object>} Array of objects
 */
const parseCSV = (csvString) => {
    const lines = csvString.trim().split('\n');
    if (lines.length === 0) return [];
    
    // Parse headers
    const headers = parseCSVLine(lines[0]);
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        data.push(row);
    }
    
    return data;
};

// Helper to parse a single CSV line
const parseCSVLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current.trim());
    return values;
};

module.exports = { generateCSV, parseCSV };