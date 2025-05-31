const express = require("express");
const firebaseAuthMiddleware = require("../middlewares/auth.middleware.js");
const {signUpUser} = require("../controllers/user.controller.js")
const router = express.Router();

router.post("/signup", firebaseAuthMiddleware, signUpUser);

module.exports = router;