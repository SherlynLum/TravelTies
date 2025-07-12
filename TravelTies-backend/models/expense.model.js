const mongoose = require('mongoose');

const owedBySchema = new mongoose.Schema({
    owedByUid: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    isPaid: {
        type: Boolean,
        default: false
    }
}, {
    _id: false
})

const expenseSchema = new mongoose.Schema({
    expenseTrackerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExpenseTracker",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    category: {
        type: String,
        enum: ["transportation", "accommodation", "food_and_drink", "entertainment", "shopping", "health"]
    },

    isShared: {
        type: Boolean,
        required: true
    },

    amountForPayer: {
        // For individual expenses, it's the full amount they paid
        // For shared expenses split evenly, it's the total divided by the number of people sharing 
        // For shared expenses with custom splits, it's the specific amount the payer assigns to themselves
        type: Number,
        required: true
    },

    owedBy: {
        type: [owedBySchema],
        default: []
    }
}, {
    timestamps: true
})

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
