const mongoose = require('mongoose');

const expenseTrackerSchema = new mongoose.Schema({
    ownerUid: {
        type: String,
        required: true
    },

    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: true
    },

    currencySymbol: {
        type: String,
        default: "$"
    },

    budget: {
        type: Number,
        min: 0
    },

    totalExpenses: {
        type: Number,
        min: 0,
        default: 0
    }
}, {
    timestamps: true
})

const ExpenseTracker = mongoose.model("ExpenseTracker", expenseTrackerSchema);

module.exports = ExpenseTracker;