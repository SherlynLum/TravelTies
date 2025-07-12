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
});

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
    type: Number,
    required: true
  },
  splitMethod: {
    type: String,
    enum: ['even', 'custom'],
    required: function () { return this.isShared; } // only required if shared
  },
  owedBy: {
    type: [owedBySchema],
    default: []
  }
}, {
  timestamps: true
});

const Expense = mongoose.model("Expense", expenseSchema);
module.exports = Expense;
