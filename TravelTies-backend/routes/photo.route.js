const express = require("express");
const {firebaseAuthMiddleware} = require("../middlewares/auth.middleware.js");
const {uploadPhotosForItineraryController} = require("../controllers/photo.controller.js")
const router = express.Router();

router.post("/", firebaseAuthMiddleware, uploadPhotosForItineraryController);
// for testing without middleware: router.post("/test", uploadPhotosForItineraryController);

module.exports = router;