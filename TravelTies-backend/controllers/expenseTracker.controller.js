const ExpenseTracker = require("../models/expense-tracker.model");

// Create a new Expense Tracker
exports.createExpenseTracker = async (req, res) => {
    try {
        const { ownerUid, tripId, currencySymbol, budget } = req.body;

        const newTracker = new ExpenseTracker({
            ownerUid,
            tripId,
            currencySymbol,
            budget,
            totalExpenses: 0 // start with zero
        });

        const savedTracker = await newTracker.save();
        res.status(201).json(savedTracker);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create expense tracker" });
    }
};

// Get Expense Tracker for a trip
exports.getExpenseTracker = async (req, res) => {
    try {
        const { tripId } = req.params;
        const tracker = await ExpenseTracker.findOne({ tripId });
        if (!tracker) {
            return res.status(404).json({ error: "Expense tracker not found" });
        }
        res.json(tracker);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch expense tracker" });
    }
};
