const express = require("express");
const {firebaseAuthMiddleware} = require("../middlewares/auth.middleware.js");
const {deleteObjectFromAWS} = require("../controllers/awss3.controller.js")
const router = express.Router();

router.delete("/", firebaseAuthMiddleware, deleteObjectFromAWS);
// for testing without middleware: router.delete("/test", deleteObjectFromAWS);

module.exports = router;