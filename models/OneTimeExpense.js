const { Schema, model } = require('mongoose');

const OneTimeExpense = new Schema({
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
    dateAndTime: {
        type: Date,
        default: Date.now(),
    },
    description: {
        type: String,
        default: null,
    },
});

module.exports = model('expense', OneTimeExpense);
