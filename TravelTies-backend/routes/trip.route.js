const express = require("express");
const firebaseAuthMiddleware = require("../middlewares/auth.middleware.js");
const {getTripProfilePicUrl, createTripController} = require("../controllers/trip.controller.js")
const router = express.Router();

router.post("/", firebaseAuthMiddleware, createTripController);
// for testing without middleware: router.post("/test", createTripController);

router.get("/profile-pic-url", firebaseAuthMiddleware, getTripProfilePicUrl);
// for testing without middleware: router.get("/test/profile-pic-url", getTripProfilePicUrl);

module.exports = router;