const express = require("express");
const {firebaseAuthMiddleware} = require("../middlewares/auth.middleware.js");
const {createTaskController, createItemController, getUncheckedTasks, getUncheckedItems, getCheckedTasks, getCheckedItems, getItemById, editTaskController, editItemController} = require("../controllers/checklist.controller.js");
const router = express.Router();

router.post("/task", firebaseAuthMiddleware, createTaskController);
// for testing without middleware: router.post("/test/task", createTaskController);

router.post("/item", firebaseAuthMiddleware, createItemController);
// for testing without middleware: router.post("/test/item", createItemController);

router.get("/:tripId/tasks/unchecked", firebaseAuthMiddleware, getUncheckedTasks);
// for testing without middleware: router.get("/test/:tripId/tasks/unchecked", getUncheckedTasks);

router.get("/:tripId/items/unchecked", firebaseAuthMiddleware, getUncheckedItems);
// for testing without middleware: router.get("/test/:tripId/items/unchecked", getUncheckedItems);

router.get("/:tripId/tasks/checked", firebaseAuthMiddleware, getCheckedTasks);
// for testing without middleware: router.get("/test/:tripId/tasks/checked", getCheckedTasks);

router.get("/:tripId/items/checked", firebaseAuthMiddleware, getCheckedItems);
// for testing without middleware: router.get("/test/:tripId/items/checked", getCheckedItems);

router.get("/:id", firebaseAuthMiddleware, getItemById);
// for testing without middleware: router.get("/test/:id", getItemById);

router.patch("/task", firebaseAuthMiddleware, editTaskController);
// for testing without middleware: router.patch("/test/task", firebaseAuthMiddleware, editTaskController);

router.patch("/item", firebaseAuthMiddleware, editItemController);
// for testing without middleware: router.patch("/test/item", firebaseAuthMiddleware, editItemController);

module.exports = router;