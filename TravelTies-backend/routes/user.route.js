const express = require("express");
const {firebaseAuthMiddleware} = require("../middlewares/auth.middleware.js");
const {syncUser, getProfilePicUrl, updateUsernameController, updateProfilePicController,
    getCurrentUserProfile, getFriendsController,
    searchFriendsController,
    searchNonFriends
} = require("../controllers/user.controller.js")
const router = express.Router();

router.post("/sync", firebaseAuthMiddleware, syncUser);
// for testing without middleware: router.post("/test/sync", syncUser);

router.get("/profile-pic-url", firebaseAuthMiddleware, getProfilePicUrl);
// for testing without middleware: router.get("/test/profile-pic-url", getProfilePicUrl);

router.patch("/username", firebaseAuthMiddleware, updateUsernameController);
// for testing without middleware: router.patch("/test/username", updateUsernameController);

router.patch("/profile-pic", firebaseAuthMiddleware, updateProfilePicController);
// for testing without middleware: router.patch("/test/profile-pic", updateProfilePicController);

router.get("/", firebaseAuthMiddleware, getCurrentUserProfile);
// for testing without middleware: router.get("/test", getCurrentUserProfile);

router.get("/friends", firebaseAuthMiddleware, getFriendsController);
// for testing without middleware: router.get("/test/friends", getFriendsController);

router.get("/friends/search", firebaseAuthMiddleware, searchFriendsController);
// for testing without middleware: router.get("/test/friends/search", searchFriendsController);

router.get("/search", firebaseAuthMiddleware, searchNonFriends);
// for testing without middleware: 
router.get("/test/search", searchNonFriends);

module.exports = router;