const { Schema, model } = require('mongoose');

const recurringExpense = new Schema({
    userid: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    nextExpenceAt: {
        type: Date,
        required: true,
    },
    lastExpenceAddedAt: {
        type: Date,
        default: null,
    },
    description: {
        type: String,
        default: null,
    },
    wayOfRepeats: {
        type: {
            repeats: Number,
            every: String, // Day, week, month
        },
        required: true,
    },
    oneTimePayments: {
        type: [String],
        default: [],
    },
});

module.exports = model('recurring', recurringExpense);
