const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense.controller");
const Expense = require("../models/expense.model"); // If you're adding the inline handler

// POST /api/expenses
router.post("/", expenseController.createExpense);

// GET /api/expenses/:trackerId
router.get("/:trackerId", expenseController.getExpensesForTracker);

// DELETE /api/expenses/:expenseId
router.delete("/:expenseId", expenseController.deleteExpense);

// ✅ ADD THIS: PUT /api/expenses/:id (for editing an expense)
router.put('/:id', expenseController.updateExpense);

module.exports = router;
