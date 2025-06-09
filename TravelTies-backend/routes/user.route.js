const express = require("express");
const firebaseAuthMiddleware = require("../middlewares/auth.middleware.js");
const {syncUser, updateUserProfileController} = require("../controllers/user.controller.js")
const router = express.Router();

router.post("/sync", firebaseAuthMiddleware, syncUser);
// for testing without middleware: router.post("/test/sync", syncUser)

router.patch("/profile", firebaseAuthMiddleware, updateUserProfileController);
// for testing without middleware: router.patch("/test/profile", updateUserProfileController)

module.exports = router;