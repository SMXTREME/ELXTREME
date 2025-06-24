const Redis = require('ioredis');

const REDIS_URI = process.env.REDIS_URI;

if (!REDIS_URI) {
    throw Error('REDIS_URI is a required environment variable');
}

/**
 * @type {import('ioredis').Redis}
 */
const redis = new Redis(REDIS_URI);
console.log('connected to Redis');

module.exports = redis;
