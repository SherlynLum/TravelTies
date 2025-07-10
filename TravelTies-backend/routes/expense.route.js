const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense.controller");

// POST /api/expenses
router.post("/", expenseController.createExpense);

// GET /api/expenses/:trackerId
router.get("/:trackerId", expenseController.getExpensesForTracker);

module.exports = router;