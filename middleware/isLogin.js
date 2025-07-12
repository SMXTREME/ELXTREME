const { Request, Response } = require('express');
const { verifyJWT } = require('../controllers/JWT');
const User = require('../models/User');
const redis = require('../redis');

/**
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */

async function isLogin(req, res, next) {
    if (!req.session?.isLogin && !req.cookies['rememberMe']) return res.redirect('/signin');
    if (!req.session?.isLogin && req.cookies['rememberMe']) {
        const data = verifyJWT(req.cookies['rememberMe']);

        const UserKey = `${data.username}-user`;

        const result = await redis.get(UserKey);

        let user = null;

        if (result) {
            user = await JSON.parse(result);
        } else {
            user = await User.findById(data._id);
            await redis.set(UserKey, JSON.stringify(user), 'EX', 60);
        }

        if (user) {
            req.session.isLogin = true;
            req.session.username = user.userName;
            req.session.password = user.password;
            req.session._id = user._id;

            next();
        } else {
            res.clearCookie('connect.sid');
            res.clearCookie('rememberMe');
            return res.redirect('/signin');
        }
    }

    next();
}

module.exports = { isLogin };
