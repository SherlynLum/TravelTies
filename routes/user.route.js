const express = require("express");
const firebaseAuthMiddleware = require("../middlewares/auth.middleware.js");
const {signUpUser, updateUserProfileController} = require("../controllers/user.controller.js")
const router = express.Router();

router.post("/signup", firebaseAuthMiddleware, signUpUser);

router.put("/profile", firebaseAuthMiddleware, updateUserProfileController);

module.exports = router;