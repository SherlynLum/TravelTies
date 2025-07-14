const express = require("express");
const {firebaseAuthMiddleware} = require("../middlewares/auth.middleware.js");
const {uploadPhotosController} = require("../controllers/photo.controller.js")
const router = express.Router();

router.post("/", firebaseAuthMiddleware, uploadPhotosController);
// for testing without middleware: router.post("/test", uploadPhotosController);

module.exports = router;