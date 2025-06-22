const {generateJoinCode, createTrip} = require("../services/trip.service.js");
const {generateUrl} = require("../services/awss3.service.js");
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
            const {key, url} = await generateUrl(mimeTypeLc, "user-profile-pics");
            return res.status(200).json({key, url});
        } catch (e) {
            return res.status(500).json({message: e.message});
        }
    } else {
        return res.status(415).json({message: "Unsupported file type"});
    }
}

const createTripController = async (req, res) => {
    const uid = req.user.uid;
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

module.exports = {
    getTripProfilePicUrl,
    createTripController
};