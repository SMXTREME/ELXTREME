const { Router } = require('express');
const redis = require('../redis');
const User = require('../models/User');
const { signJWT, verifyJWT } = require('../controllers/JWT');
const signinRouter = Router();

signinRouter.get('/', async (req, res) => {
    if (req.session?.isLogin) return res.redirect('/dashboard');
    if (req.cookies['rememberMe']) {
        const data = verifyJWT(req.cookies['rememberMe']);

        const user = await User.findById(data._id);

        req.session.isLogin = true;
        req.session.username = user.userName;
        req.session.password = user.password;
        req.session._id = user._id;

        if (user) return res.redirect('/dashboard');
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
        user = await User.findOne({ userName: username, password });
    }

    if (!user)
        return res.render('signin', { type: 'error', message: 'Incorrect Username or Password' });

    req.session.isLogin = true;
    req.session.username = user.userName;
    req.session.password = user.password;
    req.session._id = user._id;

    redis.set(UserKey, JSON.stringify(user), 'EX', 60);

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
