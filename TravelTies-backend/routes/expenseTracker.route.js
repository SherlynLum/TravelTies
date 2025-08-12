const express = require("express");
const router = express.Router();
const expenseTrackerController = require("../controllers/expenseTracker.controller");

// POST /api/expense-tracker
router.post("/", expenseTrackerController.createExpenseTracker);

// GET /api/expense-tracker/:tripId
router.get("/:tripId", expenseTrackerController.getExpenseTracker);

router.patch("/:tripId", expenseTrackerController.updateExpenseTracker);

module.exports = router;
