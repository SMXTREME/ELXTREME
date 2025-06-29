const { Router } = require('express');
const User = require('../models/User');
const OneTimeExpense = require('../models/OneTimeExpense');
const redis = require('../redis');

const oteRouter = Router();

oteRouter.post('/add', async (req, res) => {
    const title = req.body?.title || null;
    const amount = req.body?.amount || null;
    const dateAndTime = req.body?.dateAndTime || null;
    let description = req.body?.description || null;
    if (description === '') description = null;

    if (!title || !amount || !dateAndTime) return res.redirect('/dashboard');

    const oneTimeExpense = new OneTimeExpense({
        title,
        amount,
        dateAndTime,
        description,
        userid: req.session._id,
    });
    await oneTimeExpense.save();

    await redis.set(`${oneTimeExpense._id}-ote`, JSON.stringify(oneTimeExpense), 'EX', 1800);

    res.redirect('/dashboard');
});

oteRouter.get('/view/:id', async (req, res) => {
    const id = req.params.id;
    let user, oneTimeExpense;

    const UserKey = `${req.session.username}-user`;
    const OneTimeExpenseKey = `${id}-ote`;

    const [userResult, oneTimeExpenseResult] = await Promise.all([
        redis.get(UserKey),
        redis.get(OneTimeExpenseKey),
    ]);

    if (userResult) {
        user = await JSON.parse(userResult);
    } else {
        user = await User.findById(req.session._id);
        await redis.set(UserKey, JSON.stringify(user), 'EX', 60);
    }

    if (oneTimeExpenseResult) {
        oneTimeExpense = await JSON.parse(oneTimeExpenseResult);
    } else {
        oneTimeExpense = await OneTimeExpense.findById(id);
        await redis.set(OneTimeExpenseKey, JSON.stringify(oneTimeExpense), 'EX', 1800);
    }

    res.render('viewExpense', { user, oneTimeExpense, type: 'ote' });
});

oteRouter.get('/delete/:id', async (req, res) => {
    const id = req.params.id;
    const OneTimeExpenseKey = `${id}-ote`;

    const oneTimeExpense = await OneTimeExpense.findById(id);
    await oneTimeExpense.deleteOne();

    await redis.del(OneTimeExpenseKey);

    res.redirect('/dashboard');
});

module.exports = { oteRouter };
