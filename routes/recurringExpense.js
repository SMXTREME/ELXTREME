const { Router } = require('express');
const RecurringExpense = require('../models/RecurringExpense');
const OneTimeExpense = require('../models/OneTimeExpense');
const { getNextExpenseDate } = require('../controllers/getNextExpenseDate');
const User = require('../models/User');
const redis = require('../redis');
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
    const startDate = nextExpenseDate;

    if (startDate < today.setHours(0, 0, 0, 0)) return res.redirect('/dashboard');

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
        await redis.set(`${oneTimeExpense._id}-ote`, JSON.stringify(oneTimeExpense), 'EX', 1800);

        oneTimePayments.push(`${oneTimeExpense._id}`);
        nextExpenseDate = new Date(getNextExpenseDate(nextExpenceAt, repeats, every));
    }

    const recurringExpense = new RecurringExpense({
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
        startDate,
    });
    await recurringExpense.save();

    await redis.set(`${recurringExpense._id}-ote`, JSON.stringify(recurringExpense), 'EX', 1800);

    res.redirect('/dashboard');
});

reRouter.get('/view/:id', async (req, res) => {
    const id = req.params.id;
    let user, recurringExpense;

    const UserKey = `${req.session.username}-user`;
    const RecurringExpenseKey = `${id}-re`;

    const [userResult, recurringExpenseResult] = await Promise.all([
        redis.get(UserKey),
        redis.get(RecurringExpenseKey),
    ]);

    if (userResult) {
        user = await JSON.parse(userResult);
    } else {
        user = await User.findById(req.session._id);
        await redis.set(UserKey, JSON.stringify(user), 'EX', 60);
    }

    if (recurringExpenseResult) {
        recurringExpense = await JSON.parse(recurringExpenseResult);
    } else {
        recurringExpense = await RecurringExpense.findById(id);
        await redis.set(RecurringExpenseKey, JSON.stringify(recurringExpense), 'EX', 1800);
    }

    res.render('viewExpense', { user, recurringExpense, type: 're' });
});

reRouter.get('/delete/:id', async (req, res) => {
    const id = req.params.id;
    const RecurringExpenseKey = `${id}-re`;

    const recurringExpense = await RecurringExpense.findById(id);
    recurringExpense.oneTimePayments.forEach(async (id) => {
        const OneTimeExpenseKey = `${id}-ote`;

        const oneTimeExpense = await OneTimeExpense.findById(id);

        if (oneTimeExpense) {
            await oneTimeExpense.deleteOne();

            await redis.del(OneTimeExpenseKey);
        }
    });
    await recurringExpense.deleteOne();

    await redis.del(RecurringExpenseKey);

    res.redirect('/dashboard');
});

module.exports = { reRouter };
