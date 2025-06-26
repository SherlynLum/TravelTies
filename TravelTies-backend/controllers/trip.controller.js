const {generateJoinCode, createTrip, getTripsByUid, getTripsInBin, getOverview, getParticipants,
    getJoinRequests, updateOverview, updateParticipants, addParticipantsAndRemoveFromRequests,
    deleteTrip, cancelTrip, restoreTrip, searchActiveTrips, searchBinTrips, addJoinRequest
} = require("../services/trip.service.js");
const {generateUploadUrl} = require("../services/awss3.service.js");
const {validateTripDates} = require("../validators/trip.validator.js");

const getTripProfilePicUrl = async (req, res) => {
    const mimeType = req.query.type;

    if (!mimeType || typeof mimeType !== "string") {
        return res.status(400).json({message: "Missing or invalid file type"});
    }

    // ensure mimeType is all lowercase
    const mimeTypeLc = mimeType.toLowerCase();
    if (mimeTypeLc === "image/jpeg") { // frontend cropped profile pic is saved as jpeg
        try {
            const {key, url} = await generateUploadUrl(mimeTypeLc, "trip-profile-pics");
            return res.status(200).json({key, url});
        } catch (e) {
            return res.status(500).json({message: e.message});
        }
    } else {
        return res.status(415).json({message: "Unsupported file type"});
    }
}

const createTripController = async (req, res) => {
    // const uid = req.user.uid;
    // for testing without middleware: 
    const uid = req.body.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing creator uid"});
    }

    const {name, profilePicKey, startDate, endDate, noOfDays, noOfNights, tripParticipants} = req.body;

    // validation
    const datesErr = validateTripDates({startDate, endDate, noOfDays, noOfNights});
    if (datesErr) {
        return res.status(400).json({message: datesErr});
    }

    try {
        const joinCode = await generateJoinCode();

        const newTrip = await createTrip({uid, joinCode, name, profilePicKey, startDate, endDate, 
            noOfDays, noOfNights, tripParticipants});
        return res.status(201).json({trip: newTrip});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getCurrentUserActiveTrips = async (req, res) => {
    const uid = req.user.uid;
    // for testing without middleware: const uid = req.query.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }
    try {
        const trips = await getTripsByUid(uid);
        return res.status(200).json({trips});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getCurrentUserBinTrips = async (req, res) => {
    const uid = req.user.uid;
    // test without middleware: const uid = req.query.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }
    try {
        const trips = await getTripsInBin(uid);
        return res.status(200).json({trips});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getTripOverview = async (req, res) => {
    const {id} = req.params; 
    try {
        const tripOverview = await getOverview(id);
        if (!tripOverview) {
            return res.status(404).json({message: "No trip is found"})
        }
        return res.status(200).json({trip: tripOverview});
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}

const getTripParticipants = async (req, res) => {
    const {id} = req.params; 
    try {
        const tripParticipants = await getParticipants(id);
        return res.status(200).json({participants: tripParticipants});
    } catch (e) {
        if (e.message === "No trip is found") {
            return res.status(404).json({message: e.message})
        }
        return res.status(500).json({message: e.message})
    }
}

const getTripJoinRequests = async (req, res) => {
    const {id} = req.params; 
    if (!id) {
        return res.status(400).json({message: "No tripId is provided"});
    }

    try {
        const tripJoinRequests = await getJoinRequests(id);
        if (!tripJoinRequests) {
            return res.status(404).json({message: "No trip is found"})
        }
        return res.status(200).json({joinRequests: tripJoinRequests});
    } catch (e) {
        return res.status(500).json({message: e.message})
    }
}

const updateTripOverview = async (req, res) => {
    const {id} = req.params;
    const {name, profilePicKey, startDate, endDate, noOfDays, noOfNights} = req.body;

    // validation
    const datesErr = validateTripDates({startDate, endDate, noOfDays, noOfNights});
    if (datesErr) {
        return res.status(400).json({message: datesErr});
    }

    try {
        const updatedTrip = await updateOverview({id, name, profilePicKey, startDate, endDate, 
            noOfDays, noOfNights});
        if (!updatedTrip) {
            return res.status(404).json({message: "No trip is found"})
        }
        return res.status(200).json({trip: updatedTrip});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const updateTripParticipants = async (req, res) => {
    const {id} = req.params;
    const {tripParticipants} = req.body;
    try {
        const updatedTrip = await updateParticipants({id, tripParticipants});
        if (!updatedTrip) {
            return res.status(404).json({message: "No trip is found"})
        }
        return res.status(200).json({trip: updatedTrip});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const updateTripJoinRequests = async (req, res) => {
    const {id} = req.params;
    const {acceptedRequests} = req.body;
    if (!acceptedRequests || acceptedRequests.length === 0) {
        return res.status(200).json({message: "No accepted requests so no need to updated"})
    }

    try {
        const updatedTrip = await addParticipantsAndRemoveFromRequests({id, acceptedRequests});
        if (!updatedTrip) {
            return res.status(404).json({message: "No trip is found"});
        }
        return res.status(200).json({trip: updatedTrip});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const cancelTripController = async (req, res) => {
    const {id} = req.params;
    if (!id) {
        return res.status(400).json({message: "No tripId is provided"});
    }

    try {
        const updatedTrip = await cancelTrip(id);
        if (!updatedTrip) {
            return res.status(404).json({message: "No trip is found"})
        }
        return res.status(200).json({trip: updatedTrip});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const restoreTripController = async (req, res) => {
    const {id} = req.params;
    if (!id) {
        return res.status(400).json({message: "No tripId is provided"});
    }

    try {
        const updatedTrip = await restoreTrip(id);
        if (!updatedTrip) {
            return res.status(404).json({message: "No trip is found"})
        }
        return res.status(200).json({trip: updatedTrip});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const deleteTripPermanently = async (req, res) => {
    const {id} = req.params;
    if (!id) {
        return res.status(400).json({message: "No tripId is provided"});
    }

    try {
        const deletedTrip = await deleteTrip(id);
        if (!deletedTrip) {
            return res.status(404).json({message: "This trip does not exist in the first place"})
        }
        return res.sendStatus(204);
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const searchActiveTripsController = async (req, res) => {
    // const uid = req.user.uid; 
    // testing without middleware: 
    const uid = req.query.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }
    const searchTerm = req.query.term;

    try {
        const searchResults = await searchActiveTrips({uid, searchTerm});
        return res.status(200).json({results: searchResults});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const searchBinTripsController = async (req, res) => {
    const uid = req.user.uid;
    // testing without middleware: const uid = req.query.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }
    const searchTerm = req.query.term;
    
    try {
        const searchResults = await searchBinTrips({uid, searchTerm});
        return res.status(200).json({results: searchResults});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const addJoinRequestController = async (req, res) => {
    const uid = req.user.uid;
    // testing without middleware: const uid = req.body.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }
    const {code: joinCode} = req.params;

    try {
        const updatedTrip = await addJoinRequest({uid, joinCode});
        return res.status(200).json({trip: updatedTrip});
    } catch (e) {
        let message = e.message;
        if (message === "No trip is found") {
            return res.status(404).json({message})
        } else if (message === "This user has already joined this trip" || 
            message === "This user has already requested to join this trip") {
                return res.status(400).json({message})
        }
        return res.status(500).json({message});
    }
}

module.exports = {
    getTripProfilePicUrl,
    createTripController,
    getCurrentUserActiveTrips,
    getCurrentUserBinTrips,
    getTripOverview,
    getTripParticipants,
    getTripJoinRequests, 
    updateTripOverview,
    updateTripParticipants,
    updateTripJoinRequests,
    cancelTripController,
    restoreTripController,
    deleteTripPermanently, 
    searchActiveTripsController,
    searchBinTripsController,
    addJoinRequestController
};