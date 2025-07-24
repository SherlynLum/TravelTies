const express = require("express");
const {firebaseAuthMiddleware} = require("../middlewares/auth.middleware.js");
const {syncUser, getProfilePicUrl, updateUsernameController, updateProfilePicController,
    getCurrentUserProfile, getFriendsController, searchFriendsController, searchNonFriends,
    getUiPreferenceController, updateUiPreferenceController, getFriendRequestsController,
    removeFriendsOrRequests, acceptRequestsController, addFriends, linkEmail, rateUs
} = require("../controllers/user.controller.js");
const router = express.Router();

router.post("/sync", firebaseAuthMiddleware, syncUser);
// for testing without middleware: router.post("/test/sync", syncUser);

router.post("/rate", firebaseAuthMiddleware, rateUs);
// for testing without middleware: router.post("/test/rate", rateUs);

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
// for testing without middleware: router.get("/test/search", searchNonFriends);

router.get("/preference", firebaseAuthMiddleware, getUiPreferenceController);
// for testing without middleware: router.get("/test/preference", getUiPreferenceController);

router.patch("/preference", firebaseAuthMiddleware, updateUiPreferenceController);
// for testing without middleware: router.patch("/test/preference", updateUiPreferenceController);

router.get("/requests", firebaseAuthMiddleware, getFriendRequestsController);
// for testing without middleware: router.get("/test/requests", getFriendRequestsController);

router.patch("/friends-or-requests/remove", firebaseAuthMiddleware, removeFriendsOrRequests);
// for testing without middleware: router.patch("/test/friends-or-requests/remove", removeFriendsOrRequests);

router.patch("/requests/accept", firebaseAuthMiddleware, acceptRequestsController);
// for testing without middleware: router.patch("/test/requests/accept", acceptRequestsController);

router.patch("/requests/send", firebaseAuthMiddleware, addFriends);
// for testing without middleware: router.patch("/test/requests/send", addFriends);

router.patch("/link-email", firebaseAuthMiddleware, linkEmail);
// for testing without middleware: router.patch("/test/link-email", linkEmail);

module.exports = router;