const { Router } = require('express');
const redis = require('../redis');
const User = require('../models/User');
const { signJWT, verifyJWT } = require('../controllers/JWT');
const { decrypt } = require('../controllers/passwordEncription');
const signinRouter = Router();

signinRouter.get('/', async (req, res) => {
    if (req.session?.isLogin) return res.redirect('/dashboard');
    if (req.cookies['rememberMe']) {
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

            return res.redirect('/dashboard');
        } else {
            res.clearCookie('connect.sid');
            res.clearCookie('rememberMe');
        }
    }

    res.render('signin', { type: null, message: null });
});

signinRouter.post('/', async (req, res) => {
    const username = req.body?.username?.trim() || null;
    const password = req.body?.password || null;
    const rememberMe = req.body?.rememberMe || null;

    const UserKey = `${username}-user`;

    const result = await redis.get(UserKey);

    let user;

    if (result) {
        user = await JSON.parse(result);
    } else {
        user = await User.findOne({ userName: username });
        await redis.set(UserKey, JSON.stringify(user), 'EX', 60);
    }

    const userPassword = decrypt(`${user.password}`);
    if (userPassword !== password) user === null;

    if (!user)
        return res.render('signin', { type: 'error', message: 'Incorrect Username or Password' });

    req.session.isLogin = true;
    req.session.username = user.userName;
    req.session.password = user.password;
    req.session._id = user._id;

    if (rememberMe) {
        res.cookie(
            'rememberMe',
            signJWT({ username: user.userName, password: user.password, _id: user._id }),
            { maxAge: 30 * 24 * 60 * 60 * 1000 }
        );
    }

    res.redirect('/dashboard');
});

module.exports = { signinRouter };
