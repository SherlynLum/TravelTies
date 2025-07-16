const express = require("express");
const {firebaseAuthMiddleware, requireCreator, requireCreatorOrAdmin, requireParticipants} = require("../middlewares/auth.middleware.js");
const {getTripProfilePicUrl, createTripController, getCurrentUserActiveTrips,
    getCurrentUserBinTrips, getTripOverview, getTripParticipants, getTripJoinRequests,
    updateTripController, updateTripJoinRequests, cancelTripController, restoreTripController, 
    deleteTripPermanently, searchActiveTripsController, searchBinTripsController, 
    addJoinRequestController, getTripJoinCode, removeBuddyController, getCardsController,
    getOrderInTabController,
} = require("../controllers/trip.controller.js");
const router = express.Router();

router.post("/", firebaseAuthMiddleware, createTripController);
// for testing without middleware: router.post("/test", createTripController);

router.get("/profile-pic-url", firebaseAuthMiddleware, getTripProfilePicUrl);
// for testing without middleware: router.get("/test/profile-pic-url", getTripProfilePicUrl);

router.get("/", firebaseAuthMiddleware, getCurrentUserActiveTrips);
// for testing without middleware: router.get("/test", getCurrentUserActiveTrips);

router.get("/bin", firebaseAuthMiddleware, getCurrentUserBinTrips);
// for testing without middleware: router.get("/test/bin", getCurrentUserBinTrips);

router.get("/overview/:id", firebaseAuthMiddleware, getTripOverview);
// for testing without middleware: router.get("/test/overview/:id", getTripOverview);

router.get("/joincode/:id", firebaseAuthMiddleware, getTripJoinCode);
// for testing without middleware: router.get("/test/joincode/:id, getTripJoinCode);

router.get("/participants/:id", firebaseAuthMiddleware, getTripParticipants);
// for testing without middleware: router.get("/test/participants/:id", getTripParticipants);

router.get("/requests/:id", firebaseAuthMiddleware, getTripJoinRequests);
// for testing without middleware: router.get("/test/requests/:id", getTripJoinRequests);

router.get("/search", firebaseAuthMiddleware, searchActiveTripsController);
// for testing without middleware: router.get("/test/search", searchActiveTripsController);

router.get("/bin/search", firebaseAuthMiddleware, searchBinTripsController);
// for testing without middleware: router.get("/test/bin/search", searchBinTripsController);

router.get("/:id/cards", firebaseAuthMiddleware, getCardsController);
// for testing without middleware: router.get("/test/:id/cards", getCardsController);

router.get("/tabs/:id", firebaseAuthMiddleware, getOrderInTabController);
// for testing without middleware: router.get("/test/tabs/:id", getOrderInTabController);

router.patch("/:id", firebaseAuthMiddleware, requireParticipants, updateTripController);
// for testing without middleware: router.patch("/test/:id", requireParticipants, updateTripOverview);

// for user to request to join this trip
router.patch("/request/:code", firebaseAuthMiddleware, addJoinRequestController);
// for testing without middleware: router.patch("/test/request/:code", addJoinRequestController);

router.patch("/requests/:id", firebaseAuthMiddleware, requireCreatorOrAdmin, updateTripJoinRequests);
// for testing without middleware: router.patch("/test/requests/:id", requireCreatorOrAdmin, updateTripJoinRequests);

router.patch("/cancel/:id", firebaseAuthMiddleware, requireCreator, cancelTripController);
// for testing without middleware: router.patch("/test/cancel/:id", requireCreator, cancelTripController);

router.patch("/restore/:id", firebaseAuthMiddleware, requireCreator, restoreTripController);
// for testing without middleware: router.patch("/test/restore/:id", requireCreator, restoreTripController);

router.patch("/leave/:id", firebaseAuthMiddleware, requireParticipants, removeBuddyController);
// for testing without middleware: router.patch("/test/restore/:id", requireParticipants, removeBuddyController);

router.delete("/:id", firebaseAuthMiddleware, requireCreator, deleteTripPermanently);
// for testing without middleware: router.delete("/test/:id", requireCreator, deleteTripPermanently);

module.exports = router;