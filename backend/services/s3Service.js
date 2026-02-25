const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Upload file to S3
 * @param {Buffer|string} content - File content
 * @param {string} key - S3 key (path)
 * @param {string} contentType - MIME type
 * @returns {Promise<{url: string, key: string}>}
 */
const uploadFile = async (content, key, contentType = 'text/plain') => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: content,
        ContentType: contentType
    };

    const result = await s3.upload(params).promise();
    
    return {
        url: result.Location,
        key: result.Key
    };
};

/**
 * Upload markdown content
 * @param {string} markdown - Markdown content
 * @param {string} folder - Folder path (e.g., 'problems', 'editorials')
 * @returns {Promise<{url: string, key: string}>}
 */
const uploadMarkdown = async (markdown, folder = 'markdown') => {
    const key = `${folder}/${uuidv4()}.md`;
    return uploadFile(markdown, key, 'text/markdown');
};

/**
 * Upload code file
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {string} folder - Folder path
 * @returns {Promise<{url: string, key: string}>}
 */
const uploadCode = async (code, language, folder = 'solutions') => {
    const extensions = {
        'cpp': 'cpp',
        'c': 'c',
        'python': 'py',
        'java': 'java',
        'javascript': 'js'
    };
    const ext = extensions[language] || 'txt';
    const key = `${folder}/${uuidv4()}.${ext}`;
    return uploadFile(code, key, 'text/plain');
};

/**
 * Upload test case files
 * @param {string} input - Input data
 * @param {string} output - Expected output
 * @param {string} problemId - Problem ID
 * @param {number} index - Test case index
 * @returns {Promise<{inputKey: string, outputKey: string}>}
 */
const uploadTestCase = async (input, output, problemId, index) => {
    const inputKey = `testcases/${problemId}/input_${index}.txt`;
    const outputKey = `testcases/${problemId}/output_${index}.txt`;

    await Promise.all([
        uploadFile(input, inputKey, 'text/plain'),
        uploadFile(output, outputKey, 'text/plain')
    ]);

    return { inputKey, outputKey };
};

/**
 * Get file from S3
 * @param {string} key - S3 key
 * @returns {Promise<string>}
 */
const getFile = async (key) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key
    };

    const result = await s3.getObject(params).promise();
    return result.Body.toString('utf-8');
};

/**
 * Delete file from S3
 * @param {string} key - S3 key
 * @returns {Promise<void>}
 */
const deleteFile = async (key) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key
    };

    await s3.deleteObject(params).promise();
};

/**
 * Generate pre-signed URL for direct upload
 * @param {string} key - S3 key
 * @param {string} contentType - MIME type
 * @param {number} expiresIn - URL expiry in seconds (default: 5 mins)
 * @returns {Promise<string>}
 */
const getSignedUploadUrl = async (key, contentType, expiresIn = 300) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        Expires: expiresIn
    };

    return s3.getSignedUrlPromise('putObject', params);
};

/**
 * Generate pre-signed URL for download
 * @param {string} key - S3 key
 * @param {number} expiresIn - URL expiry in seconds (default: 1 hour)
 * @returns {Promise<string>}
 */
const getSignedDownloadUrl = async (key, expiresIn = 3600) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Expires: expiresIn
    };

    return s3.getSignedUrlPromise('getObject', params);
};

module.exports = {
    uploadFile,
    uploadMarkdown,
    uploadCode,
    uploadTestCase,
    getFile,
    deleteFile,
    getSignedUploadUrl,
    getSignedDownloadUrl
};