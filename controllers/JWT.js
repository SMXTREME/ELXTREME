const { verify, sign } = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function verifyJWT(token) {
    return verify(token, JWT_SECRET);
}

function signJWT(payload) {
    return sign(JSON.stringify(payload), JWT_SECRET);
}

module.exports = { verifyJWT, signJWT };
