const {uploadPhotosForItinerary} = require("../services/photo.service.js");

const uploadPhotosForItineraryController = async (req, res) => {
    const uid = req.user.uid;
    // testing without middleware: const uid = req.body.uid;
    const {tripId, keys} = req.body;
    if (!uid || !tripId || !keys || keys.length === 0) {
        return res.status(400).json({message: "Missing information to upload photos"});
    }

    try {
        const picIds = await uploadPhotosForItinerary({uid, tripId, keys});
        if (!picIds || picIds.length === 0) {
            return res.status(500).json({message: "No photo objects were created"});
        }
        return res.status(201).json({picIds});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

module.exports = {
    uploadPhotosForItineraryController
}