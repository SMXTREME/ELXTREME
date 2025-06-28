const { Router } = require('express');
const { signupRouter } = require('./signup');
const { signinRouter } = require('./signin');
const { dashboardRouter } = require('./dashboard');

const indexRouter = Router();

indexRouter.get('/', async (req, res) => {
    res.render('home');
});

indexRouter.use('/signup', signupRouter);
indexRouter.use('/signin', signinRouter);
indexRouter.use('/dashboard', dashboardRouter);

indexRouter.use('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Could not log you out');
        }
        res.clearCookie('connect.sid');
        res.clearCookie('rememberMe');
        res.redirect('/');
    });
});

module.exports = { indexRouter };
