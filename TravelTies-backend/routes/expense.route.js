const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense.controller");

// POST /api/expenses
router.post("/", expenseController.createExpense);

// GET /api/expenses/:trackerId
router.get("/:trackerId", expenseController.getExpensesForTracker);

// DELETE /api/expenses/:expenseId
router.delete("/:expenseId", expenseController.deleteExpense);

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
