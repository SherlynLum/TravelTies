const express = require("express");
const {firebaseAuthMiddleware} = require("../middlewares/auth.middleware.js");
const {syncUser, getProfilePicUrl, updateUsernameController, updateProfilePicController,
    getCurrentUserProfile, getFriendsController, searchFriendsController, searchNonFriends,
    getUiPreferenceController, updateUiPreferenceController, getFriendRequestsController,
    removeFriendOrRequest, acceptRequestController, addFriend, linkEmail, rateUs,
    getStripeOnboardUrl, getOrUpdateStripeAccount,
    getStripeUpdateUrl,
    unlinkStripeAccount
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

router.patch("/friend-or-request/remove", firebaseAuthMiddleware, removeFriendOrRequest);
// for testing without middleware: router.patch("/test/friend-or-request/remove", removeFriendOrRequest);

router.patch("/request/accept", firebaseAuthMiddleware, acceptRequestController);
// for testing without middleware: router.patch("/test/request/accept", acceptRequestController);

router.patch("/request/send", firebaseAuthMiddleware, addFriend);
// for testing without middleware: router.patch("/test/request/send", addFriend);

router.patch("/link-email", firebaseAuthMiddleware, linkEmail);
// for testing without middleware: router.patch("/test/link-email", linkEmail);

router.get("/stripe", firebaseAuthMiddleware, getOrUpdateStripeAccount); // get and also upadte db with the latest stripe details
// for testing without middleware: router.get("/test/stripe", getOrUpdateStripeAccount);

router.post("/stripe", firebaseAuthMiddleware, getStripeOnboardUrl); // also create account if do not have yet
// for testing without middleware: router.post("/test/stripe", getStripeOnboardUrl);

router.get("/stripe/update-url", firebaseAuthMiddleware, getStripeUpdateUrl); 
// for testing without middleware: router.get("/test/stripe/update-url", getStripeUpdateUrl);

router.delete("/stripe", firebaseAuthMiddleware, unlinkStripeAccount); // delete stripe account 
// for testing without middleware: router.delete("/test/stripe", unlinkStripeAccount);

module.exports = router;