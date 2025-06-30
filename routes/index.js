const { Router } = require('express');
const { signupRouter } = require('./signup');
const { signinRouter } = require('./signin');
const { dashboardRouter } = require('./dashboard');
const { isLogin } = require('../middleware/isLogin');
const RecurringExpense = require('../models/RecurringExpense');
const redis = require('../redis');
const OneTimeExpense = require('../models/OneTimeExpense');
const { getNextExpenseDate } = require('../controllers/getNextExpenseDate');

const indexRouter = Router();

indexRouter.get('/', async (req, res) => {
    res.render('home');
});

indexRouter.use('/signup', signupRouter);
indexRouter.use('/signin', signinRouter);
indexRouter.use('/dashboard', isLogin, dashboardRouter);

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

indexRouter.get('/time', async (req, res) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const timeStr = `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
    res.send(timeStr);
});

indexRouter.get('/update', async (req, res) => {
    const recurringExpenses = await RecurringExpense.find();

    for (const recurringExpense of recurringExpenses) {
        const today = new Date();
        const nextExpenseDate = new Date(recurringExpense.nextExpenceAt);

        const isToday =
            today.getFullYear() === nextExpenseDate.getFullYear() &&
            today.getMonth() === nextExpenseDate.getMonth() &&
            today.getDate() === nextExpenseDate.getDate();

        if (isToday) {
            const oneTimeExpense = new OneTimeExpense({
                amount: recurringExpense.amount,
                dateAndTime: recurringExpense.nextExpenceAt,
                description: recurringExpense.description,
                title: recurringExpense.title,
                userid: recurringExpense.userid,
            });
            await oneTimeExpense.save();
            await redis.set(
                `${oneTimeExpense._id}-ote`,
                JSON.stringify(oneTimeExpense),
                'EX',
                1800
            );
            recurringExpense.oneTimePayments.push(`${oneTimeExpense.id}`);
        }

        recurringExpense.lastExpenceAddedAt = recurringExpense.nextExpenceAt;
        recurringExpense.nextExpenceAt = new Date(
            getNextExpenseDate(
                recurringExpense.nextExpenceAt,
                recurringExpense.wayOfRepeats.repeats,
                recurringExpense.wayOfRepeats.every
            )
        );

        await recurringExpense.save();
        await redis.set(`${recurringExpense._id}-re`, JSON.stringify(recurringExpense), 'EX', 1800);
    }
    res.status(200).send('done');
});

module.exports = { indexRouter };
