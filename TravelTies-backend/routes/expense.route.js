const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense.controller");

// POST /api/expenses
router.post("/", expenseController.createExpense);

// GET /api/expenses/:trackerId
router.get("/:trackerId", expenseController.getExpensesForTracker);

// DELETE /api/expenses/:expenseId
router.delete("/:expenseId", expenseController.deleteExpense);

// routes/expenses.js
router.put('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updatedExpense);
});

module.exports = router;
