const {generateUploadUrl, generateUploadUrlWithExtension} = require("../services/awss3.service.js");
const { createNoteCard, createDestinationCard, createTransportationCard, createGeneralCard, deleteCard, 
    updateCard, getCard } = require("../services/itinerary.service.js");
const { addCard, removeCard } = require("../services/trip.service.js");
const { validateCardTime } = require("../validators/itinerary.validator.js");
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const ALLOWED_DOC_TYPES = new Set(["application/pdf", "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]);
const EXTENSION_MAP = {
    "application/pdf": "pdf", 
    "application/msword": "doc", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt"
};
const mongoose = require('mongoose');

const getPicUrl = async (req, res) => {
    const mimeType = req.query.type;

    if (!mimeType || typeof mimeType !== "string") {
        return res.status(400).json({message: "Missing or invalid file type"});
    }

    // ensure mimeType is all lowercase
    const mimeTypeLc = mimeType.toLowerCase();
    if (ALLOWED_IMAGE_TYPES.has(mimeTypeLc)) { 
        try {
            const {key, url} = await generateUploadUrl(mimeTypeLc, "photos");
            return res.status(200).json({key, url});
        } catch (e) {
            return res.status(500).json({message: e.message});
        }
    } else {
        return res.status(415).json({message: "Unsupported file type"});
    }
}

const getDocUrl = async (req, res) => {
    const mimeType = req.query.type;

    if (!mimeType || typeof mimeType !== "string") {
        return res.status(400).json({message: "Missing or invalid file type"});
    }

    // ensure mimeType is all lowercase
    const mimeTypeLc = mimeType.toLowerCase();
    if (ALLOWED_DOC_TYPES.has(mimeTypeLc)) { 
        try {
            const extension = EXTENSION_MAP[mimeTypeLc];
            const {key, url} = await generateUploadUrlWithExtension(mimeTypeLc, extension,
                "documents");
            return res.status(200).json({key, url});
        } catch (e) {
            return res.status(500).json({message: e.message});
        }
    } else {
        return res.status(415).json({message: "Unsupported file type"});
    }
}

const createNoteCardController = async (req, res) => {
    const {tripId, title, description, startDate, startTime, endDate, endTime} = req.body;

    if (!tripId) {
        return res.status(400).json({message: "Missing tripId"});
    }

    if (!title) {
        return res.status(400).json({message: "Missing title of the card"});
    }

    const timeErr = validateCardTime({startDate, startTime, endDate, endTime});
    if (timeErr) {
        return res.status(400).json({message: timeErr, timeErr: true});
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const card = await createNoteCard({tripId, title, description, startDate, startTime, endDate, 
            endTime, session});
        if (!card) {
            throw new Error("No note card is created");
        }
        const updatedTrip = await addCard({tripId, cardId: card._id, startDate, endDate, session});
        if (!updatedTrip) {
            throw new Error("No trip is found");
        }

        await session.commitTransaction();
        return res.status(201).json({card})
    } catch (e) {
        await session.abortTransaction();
        return res.status(500).json({message: e.message, error: e.errors});
    } finally {
        session.endSession();
    }
}

const createDestinationCardController = async (req, res) => {
    const {tripId, title, country, city, description, startDate, startTime, endDate, endTime, picIds, 
        docs, webUrls} = req.body;

    if (!tripId) {
        return res.status(400).json({message: "Missing tripId"});
    }

    if (!title) {
        return res.status(400).json({message: "Missing title of the card"});
    }

    if (!country) {
        return res.status(400).json({message: "Destination card must specify a country"});
    }

    const timeErr = validateCardTime({startDate, startTime, endDate, endTime});
    if (timeErr) {
        return res.status(400).json({message: timeErr, timeErr: true});
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const card = await createDestinationCard({tripId, country, city, description, startDate, startTime, 
    endDate, endTime, picIds, docs, webUrls, session});
        if (!card) {
            throw new Error("No destination card is created");
        }
        const updatedTrip = await addCard({tripId, cardId: card._id, startDate, endDate, session});
        if (!updatedTrip) {
            throw new Error("No trip is found");
        }

        await session.commitTransaction();
        return res.status(201).json({card})
    } catch (e) {
        await session.abortTransaction();
        return res.status(500).json({message: e.message});
    } finally {
        session.endSession();
    }
}

const createTransportationCardController = async (req, res) => {
    const {tripId, title, description, startDate, startTime, endDate, endTime, departureAddress, 
        arrivalAddress, picIds, docs, webUrls} = req.body;

    if (!tripId) {
        return res.status(400).json({message: "Missing tripId"});
    }

    if (!title) {
        return res.status(400).json({message: "Missing title of the card"});
    }

    const timeErr = validateCardTime({startDate, startTime, endDate, endTime});
    if (timeErr) {
        return res.status(400).json({message: timeErr, timeErr: true});
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const card = await createTransportationCard({tripId, title, description, startDate, startTime, 
            endDate, endTime, departureAddress, arrivalAddress, picIds, docs, webUrls, session});
        if (!card) {
            throw new Error("No transportation card is created");
        }
        const updatedTrip = await addCard({tripId, cardId: card._id, startDate, endDate, session});
        if (!updatedTrip) {
            throw new Error("No trip is found");
        }

        await session.commitTransaction();
        return res.status(201).json({card})
    } catch (e) {
        await session.abortTransaction();
        return res.status(500).json({message: e.message});
    } finally {
        session.endSession();
    }
}

const createGeneralCardController = async (req, res) => {
    const {tripId, cardType, title, description, startDate, startTime, endDate, endTime, 
        generalAddress, picIds, docs, webUrls} = req.body;

    if (!tripId) {
        return res.status(400).json({message: "Missing tripId"});
    }

    if (!title) {
        return res.status(400).json({message: "Missing title of the card"});
    }

    if (!cardType) {
        return res.status(400).json({message: "Missing type of the card"});
    }

    const timeErr = validateCardTime({startDate, startTime, endDate, endTime});
    if (timeErr) {
        return res.status(400).json({message: timeErr, timeErr: true});
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const card = await createGeneralCard({tripId, cardType, title, description, startDate, 
            startTime, endDate, endTime, generalAddress, picIds, docs, webUrls, session});
        if (!card) {
            throw new Error("No general card is created");
        }
        const updatedTrip = await addCard({tripId, cardId: card._id, startDate, endDate, session});
        if (!updatedTrip) {
            throw new Error("No trip is found");
        }

        await session.commitTransaction();
        return res.status(201).json({card})
    } catch (e) {
        await session.abortTransaction();
        return res.status(500).json({message: e.message});
    } finally {
        session.endSession();
    }
}

const deleteCardController = async (req, res) => {
    const {id} = req.params;
    if (!id) {
        return res.status(400).json({message: "No cardId is provided"});
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const deletedCard = await deleteCard(id, session);
        if (!deletedCard) {
            return res.status(404).json({message: "This card does not exist in the first place"})
        }

        const tripWithCardRemoved = await removeCard({tripId: deletedCard.tripId, 
            cardId: deletedCard._id, session});
        if (!tripWithCardRemoved) {
            throw new Error("No trip is found");
        }
        await session.commitTransaction();
        return res.sendStatus(204);
    } catch (e) {
        await session.abortTransaction();
        return res.status(500).json({message: e.message});
    } finally {
        session.endSession();
    }
}

const getCardController = async (req, res) => {
    const {id} = req.params;
    if (!id) {
        return res.status(400).json({message: "No cardId is provided"});
    }

    try {
        const card = await getCard(id);
        if (!card) {
            return res.status(404).json({message: "No card is found"})
        }
        return res.status(200).json({card});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const updateCardController = async (req, res) => {
    const {id: cardId} = req.params;
    if (!cardId) {
        return res.status(400).json({message: "Missing cardId"});
    }
    const {cardType, title, description, startDate, startTime, endDate, endTime, generalAddress, 
        departureAddress, arrivalAddress, country, city, picIds, docs, webUrls} = req.body;
    if (!cardType) {
        return res.status(400).json({message: "Missing card type"});
    }
    if (!title) {
        return res.status(400).json({message: "Missing title of the card"});
    }
    
    const timeErr = validateCardTime({startDate, startTime, endDate, endTime});
    if (timeErr) {
        return res.status(400).json({message: timeErr, timeErr: true});
    }
    
    if (cardType === "destination" && !country) {
        return res.status(400).json({message: "Destination card must specify a country"});
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const card = await updateCard({cardId, cardType, title, description, startDate, startTime, 
            endDate, endTime, generalAddress, departureAddress, arrivalAddress, country, city, picIds, 
            docs, webUrls, session});
        if (!card) {
            return res.status(500).json({message: "No card is found"});
        }

        const tripWithCardRemoved = await removeCard({tripId: card.tripId, cardId: card._id, session});
        const tripWithCardAdded = await addCard({tripId: card.tripId, cardId: card._id, startDate, 
            endDate, session});
        if (!tripWithCardRemoved || !tripWithCardAdded) {
            throw new Error("No trip is found");
        }

        await session.commitTransaction();
        return res.status(200).json({card});
    } catch (e) {
        await session.abortTransaction();
        return res.status(500).json({message: e.message});
    } finally {
        session.endSession();
    }
}

module.exports = {
    getPicUrl,
    getDocUrl,
    createNoteCardController,
    createDestinationCardController,
    createTransportationCardController,
    createGeneralCardController,
    deleteCardController,
    getCardController,
    updateCardController
}