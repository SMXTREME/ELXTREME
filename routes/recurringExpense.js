const { Router } = require('express');
const RecurringExpense = require('../models/RecurringExpense');
const OneTimeExpense = require('../models/OneTimeExpense');
const { getNextExpenseDate } = require('../controllers/getNextExpenseDate');
const User = require('../models/User');
const reRouter = Router();

reRouter.post('/add', async (req, res) => {
    const userid = req.session._id;
    const title = req.body?.title || null;
    const amount = req.body?.amount || null;
    const nextExpenceAt = req.body?.nextExpenceAt || null;
    const every = req.body?.every || null;
    let repeats = req.body?.repeats || null;
    if (repeats) repeats = Number(repeats);
    let lastExpenceAddedAt = null;
    let description = req.body?.description || null;
    if (description === '') description = null;

    if (!title || !amount || !nextExpenceAt || !every || !repeats)
        return res.redirect('/dashboard');

    const today = new Date();
    let nextExpenseDate = new Date(nextExpenceAt);
    const isToday =
        today.getFullYear() === nextExpenseDate.getFullYear() &&
        today.getMonth() === nextExpenseDate.getMonth() &&
        today.getDate() === nextExpenseDate.getDate();

    let oneTimePayments = [];

    if (isToday) {
        lastExpenceAddedAt = nextExpenseDate;

        const oneTimeExpense = new OneTimeExpense({
            amount,
            dateAndTime: nextExpenseDate,
            description,
            title,
            userid,
        });
        await oneTimeExpense.save();

        oneTimePayments.push(`${oneTimeExpense._id}`);
        nextExpenseDate = new Date(getNextExpenseDate(nextExpenceAt, repeats, every));
    }

    const oneTimeExpense = new RecurringExpense({
        title,
        amount,
        description,
        userid,
        wayOfRepeats: {
            repeats,
            every,
        },
        nextExpenceAt: nextExpenseDate,
        lastExpenceAddedAt,
        oneTimePayments,
    });
    await oneTimeExpense.save();

    res.redirect('/dashboard');
});

reRouter.get('/view/:id', async (req, res) => {
    const id = req.params.id;

    const user = await User.findById(req.session._id);
    const recurringExpense = await RecurringExpense.findById(id);

    res.render('viewExpense', { user, recurringExpense, type: 're' });
});

reRouter.get('/delete/:id', async (req, res) => {
    const id = req.params.id;

    const recurringExpense = await RecurringExpense.findById(id);
    recurringExpense.oneTimePayments.forEach(async (id) => {
        const oneTimeExpense = await OneTimeExpense.findById(id);
        await oneTimeExpense.deleteOne();
    });
    await recurringExpense.deleteOne();

    res.redirect('/dashboard');
});

module.exports = { reRouter };
