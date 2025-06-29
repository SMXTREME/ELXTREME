const crypto = require('node:crypto');

const DB_ENCRYPTION_KEY = process.env.JWT_SECRET;

if (!DB_ENCRYPTION_KEY) {
    throw new Error('Env variable DB_ENCRYPTION_KEY not set.');
}

const key = crypto.scryptSync(DB_ENCRYPTION_KEY, 'salt', 32);

const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (encryptedContent) => {
    const [ivHex, encryptedData] = encryptedContent.split(':');

    if (!ivHex || !encryptedData) {
        throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

module.exports = { encrypt, decrypt };
