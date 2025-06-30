const { Router } = require('express');
const OneTimeExpense = require('../models/OneTimeExpense');
const RecurringExpense = require('../models/RecurringExpense');
const User = require('../models/User');

const { oteRouter } = require('./oneTimeExpense');
const { reRouter } = require('./recurringExpense');
const redis = require('../redis');

const dashboardRouter = Router();

dashboardRouter.get('/', async (req, res) => {
    const userid = req.session._id;

    let user;
    const UserKey = `${req.session.username}-user`;

    const [userResult, oneTimeExpense, recurringExpense] = await Promise.all([
        redis.get(UserKey),
        OneTimeExpense.find({ userid }).sort({ dateAndTime: -1 }),
        RecurringExpense.find({ userid }),
    ]);

    if (userResult) {
        user = JSON.parse(userResult);
    } else {
        user = await User.findById(userid);
    }

    const monthlyTotals = {};
    oneTimeExpense.forEach((exp) => {
        const date = new Date(exp.dateAndTime);
        const year = date.getFullYear();
        const month = date.getMonth();
        if (!monthlyTotals[year]) {
            monthlyTotals[year] = Array(12).fill(0);
        }
        monthlyTotals[year][month] += exp.amount;
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentMonthsTotal = monthlyTotals[currentYear]
        ? monthlyTotals[currentYear][currentMonth]
        : 0;

    const currentMonthsTotalFormatted = currentMonthsTotal.toLocaleString('en-IN');

    res.render('dashboard', {
        oneTimeExpense,
        recurringExpense,
        user,
        currentMonthsTotalFormatted,
    });
});

dashboardRouter.use('/ote', oteRouter);
dashboardRouter.use('/re', reRouter);

module.exports = { dashboardRouter };
