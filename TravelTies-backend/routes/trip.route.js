const express = require("express");
const {firebaseAuthMiddleware, requireCreator, requireCreatorOrAdmin, requireParticipants} = require("../middlewares/auth.middleware.js");
const {getTripProfilePicUrl, createTripController, getCurrentUserActiveTrips,
    getCurrentUserBinTrips, getTripOverview, getTripParticipants, getTripJoinRequests,
    updateTripOverview, updateTripJoinRequests, updateTripParticipants, cancelTripController,
    restoreTripController, deleteTripPermanently, searchActiveTripsController, 
    searchBinTripsController
} = require("../controllers/trip.controller.js")
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

router.get("/participants/:id", firebaseAuthMiddleware, getTripParticipants);
// for testing without middleware: router.get("/test/participants/:id", getTripParticipants);

router.get("/requests/:id", firebaseAuthMiddleware, getTripJoinRequests);
// for testing without middleware: router.get("/test/requests/:id", getTripJoinRequests);

router.patch("/overview/:id", firebaseAuthMiddleware, requireParticipants, updateTripOverview);
// for testing without middleware: router.patch("/test/overview/:id", requireParticipants, updateTripOverview);

router.patch("/participants/:id", firebaseAuthMiddleware, requireCreatorOrAdmin, updateTripParticipants);
// for testing without middleware: router.patch("/test/participants/:id", requireCreatorOrAdmin, updateTripParticipants);

router.patch("/requests/:id", firebaseAuthMiddleware, requireCreatorOrAdmin, updateTripJoinRequests);
// for testing without middleware: router.patch("/test/requests/:id", updateTripJoinRequests);

router.patch("/cancel/:id", firebaseAuthMiddleware, requireCreator, cancelTripController);
// for testing without middleware: router.patch("/test/cancel/:id", requireCreator, cancelTripController);

router.patch("/restore/:id", firebaseAuthMiddleware, requireCreator, restoreTripController);
// for testing without middleware: router.patch("/test/restore/:id", requireCreator, restoreTripController);

router.delete("/:id", firebaseAuthMiddleware, requireCreator, deleteTripPermanently);
// for testing without middleware: router.delete("/test/:id", deleteTripPermanently);

router.get("/search", firebaseAuthMiddleware, searchActiveTripsController);
// for testing without middleware: router.get("/test/search", searchActiveTripsController);

router.get("/bin/search", firebaseAuthMiddleware, searchBinTripsController);
// for testing without middleware: router.get("/test/bin/search", searchBinTripsController);

module.exports = router;