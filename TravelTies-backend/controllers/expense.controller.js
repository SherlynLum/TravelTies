const Expense = require("../models/expense.model");
const ExpenseTracker = require("../models/expense-tracker.model");

// Add a new Expense
exports.createExpense = async (req, res) => {
    try {
        const {
            expenseTrackerId,
            name,
            category,
            isShared,
            amountForPayer,
            owedBy
        } = req.body;

        const newExpense = new Expense({
            expenseTrackerId,
            name,
            category,
            isShared,
            amountForPayer,
            owedBy: isShared ? owedBy : []
        });

        const savedExpense = await newExpense.save();

        // Update total expenses in the tracker
        const tracker = await ExpenseTracker.findById(expenseTrackerId);
        if (!tracker) {
            return res.status(404).json({ error: "Expense tracker not found" });
        }
        tracker.totalExpenses += amountForPayer;
        await tracker.save();

        res.status(201).json(savedExpense);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create expense" });
    }
};

// Get all Expenses for a tracker
exports.getExpensesForTracker = async (req, res) => {
    try {
        const { trackerId } = req.params;
        const expenses = await Expense.find({ expenseTrackerId: trackerId });
        res.json(expenses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
};

// Delete a specific expense
exports.deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const deletedExpense = await Expense.findByIdAndDelete(expenseId);
    if (!deletedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Deduct from totalExpenses
    const tracker = await ExpenseTracker.findById(deletedExpense.expenseTrackerId);
    if (tracker) {
      tracker.totalExpenses -= deletedExpense.amountForPayer;
      await tracker.save();
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
};
