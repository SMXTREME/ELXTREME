const redis = require('../redis');
const { Router } = require('express');
const User = require('../models/User');
const { encrypt, decrypt } = require('../controllers/passwordEncription');

const signupRouter = Router();

signupRouter.get('/', async (req, res) => {
    res.render('signup', { type: null, message: null }); // null | 'success' | 'error'
});

signupRouter.post('/', async (req, res) => {
    const firstName = req.body?.firstName?.trim() || null;
    const lastName = req.body?.lastName?.trim() || null;
    const username = req.body?.username?.trim() || null;
    let password = req.body?.password || null;

    console.log(firstName, lastName, username, password);
    const UserKey = `${username}-user`;

    if (!firstName || !lastName || !username || !password)
        return res.render('signup', {
            type: 'error',
            message: 'Kindly provide all the information',
        });

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
        return res.render('signup', {
            type: 'error',
            message: 'Username must be 3-20 characters and alphanumeric (underscores allowed)',
        });

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-|<>]{6,}$/.test(password))
        return res.render('signup', {
            type: 'error',
            message:
                'Password must be at least 6 characters long and include at least one letter and one number. Allowed special characters: ! @ # $ % ^ & * ( ) _ + - | < >',
        });

    if (!/^[a-zA-Z]{2,}$/.test(firstName) || !/^[a-zA-Z]{2,}$/.test(lastName))
        return res.render('signup', {
            type: 'error',
            message: 'First and last names must be at least 2 letters and contain only letters',
        });

    password = encrypt(password);

    const result = await redis.get(UserKey);
    let user;

    if (result) {
        user = await JSON.parse(result);
    } else {
        user = await User.findOne({ userName: username });
    }

    if (user)
        return res.render('signup', {
            type: 'error',
            message: `The username ${username} is already in use by another user`,
        });

    user = new User({
        firstName,
        lastName,
        password,
        userName: username,
        currency: null,
    });
    await user.save();

    await redis.set(UserKey, JSON.stringify(user), 'EX', 60);

    res.render('signup', { type: 'success', message: 'Account created' });
});

module.exports = { signupRouter };
