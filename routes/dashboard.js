const { Router } = require('express');
const OneTimeExpense = require('../models/OneTimeExpense');
const RecurringExpense = require('../models/RecurringExpense');
const User = require('../models/User');

const { oteRouter } = require('./oneTimeExpense');
const { reRouter } = require('./recurringExpense');

const dashboardRouter = Router();

dashboardRouter.get('/', async (req, res) => {
    const userid = req.session._id;

    const user = await User.findById(userid);
    const oneTimeExpense = await OneTimeExpense.find({ userid }).sort({ dateAndTime: -1 });
    const recurringExpense = await RecurringExpense.find({ userid });

    // Calculate total one-time expenses for each month of each year
    const monthlyTotals = {}; // { [year]: [12 months array] }
    oneTimeExpense.forEach((exp) => {
        const date = new Date(exp.dateAndTime);
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11
        if (!monthlyTotals[year]) {
            monthlyTotals[year] = Array(12).fill(0);
        }
        monthlyTotals[year][month] += exp.amount;
    });

    // Calculate the total one-time expenses for the current month and year
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const currentMonthsTotal = monthlyTotals[currentYear]
        ? monthlyTotals[currentYear][currentMonth]
        : 0;

    // Format total in Indian number system
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
