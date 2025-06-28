const { Router } = require('express');
const User = require('../models/User');
const OneTimeExpense = require('../models/OneTimeExpense');

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

    res.redirect('/dashboard');
});

oteRouter.get('/view/:id', async (req, res) => {
    const id = req.params.id;

    const user = await User.findById(req.session._id);
    const oneTimeExpense = await OneTimeExpense.findById(id);

    res.render('viewExpense', { user, oneTimeExpense, type: 'ote' });
});

oteRouter.get('/delete/:id', async (req, res) => {
    const id = req.params.id;

    const oneTimeExpense = await OneTimeExpense.findById(id);
    await oneTimeExpense.deleteOne();

    res.redirect('/dashboard');
});

module.exports = { oteRouter };
