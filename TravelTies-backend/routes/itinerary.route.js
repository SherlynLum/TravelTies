const express = require("express");
const {firebaseAuthMiddleware} = require("../middlewares/auth.middleware.js");
const { createNoteCardController, getPicUrl, getDocUrl, createDestinationCardController, 
    createTransportationCardController, createGeneralCardController,
    deleteCardController,
    getCardController,
    updateCardController} = require("../controllers/itinerary.controller.js");
const router = express.Router();

// router.post("/note", firebaseAuthMiddleware, createNoteCardController);
router.post("/test/note", createNoteCardController);

router.post("/destination", firebaseAuthMiddleware, createDestinationCardController);
// for testing without middleware: router.post("/test/destination", createDestinationCardController);

router.post("/transportation", firebaseAuthMiddleware, createTransportationCardController);
// for testing without middleware: router.post("/test/transportation", createTransportationCardController);

router.post("/", firebaseAuthMiddleware, createGeneralCardController);
// for testing without middleware: router.post("/test", createGeneralCardController);

router.get("/pic-url", firebaseAuthMiddleware, getPicUrl);
// for testing without middleware: router.get("/test/pic-url", getPicUrl);

router.get("/doc-url", firebaseAuthMiddleware, getDocUrl);
// for testing without middleware: router.get("/test/doc-url", getDocUrl);

router.get("/:id", firebaseAuthMiddleware, getCardController);
// for testing without middleware: router.get("/test/:id", getCardController);

// router.delete("/:id", firebaseAuthMiddleware, deleteCardController);
router.delete("/test/:id", deleteCardController);

router.patch("/:id", firebaseAuthMiddleware, updateCardController);
// for testing without middleware: router.post("/test/:id", updateCardController);

module.exports = router;