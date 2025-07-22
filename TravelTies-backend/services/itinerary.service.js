const Card = require("../models/card.model.js");

const createNoteCard = async ({tripId, title, description, startDate, startTime, endDate, 
    endTime, session}) => {
        const newCard = await Card.create({tripId, cardType: "note", title, description, startDate, 
            startTime, endDate, endTime}, {session});
        return newCard;
}

const createDestinationCard = async ({tripId, title, country, city, description, startDate, startTime, 
    endDate, endTime, picIds, docs, webUrls, session}) => {
        const newCard = await Card.create({tripId, cardType: "destination", 
            title, description, startDate, startTime, endDate, endTime, country, city, picIds, docs, 
            webUrls}, {session});
        return newCard;
}

const createTransportationCard = async ({tripId, title, description, startDate, startTime, 
    endDate, endTime, departureAddress, arrivalAddress, picIds, docs, webUrls, session}) => {
        const newCard = await Card.create({tripId, cardType: "transportation", title, description, 
            startDate, startTime, endDate, endTime, departureAddress, arrivalAddress, picIds, docs, 
            webUrls}, {session});
        return newCard;
}

const createGeneralCard = async ({tripId, cardType, title, description, startDate, startTime, 
    endDate, endTime, generalAddress, picIds, docs, webUrls, session}) => {
        const newCard = await Card.create({tripId, cardType, title, description, startDate, startTime, 
            endDate, endTime, generalAddress, picIds, docs, webUrls}, {session});
        return newCard;
}

const deleteCard = async (id, session) => {
    const deletedCard = await Card.findByIdAndDelete(id, {session});
    return deletedCard;
}

const getCard = async (id) => {
    const card = await Card.findById(id).populate("picIds", "key");
    return card;
}

const getCardPreview = async (id) => {
    const card = await Card.findById(id, {cardType: 1, title: 1, description: 1, startDate: 1, 
        startTime: 1, endDate: 1, endTime: 1, generalAddress: 1, departureAddress: 1, arrivalAddress: 1
    });
    return card;
}

const updateCard = async ({cardId, cardType, title, description, startDate, startTime, 
    endDate, endTime, generalAddress, departureAddress, arrivalAddress, country, city, picIds, docs, 
    webUrls, session}) => {
        const card = await Card.findByIdAndUpdate(cardId,
            {$set: {cardType, title, description, startDate, startTime, endDate, endTime, 
                generalAddress, departureAddress, arrivalAddress, country, city, picIds, docs, 
                webUrls}},
            {session, new: true, runValidators: true}
        )
        return card;
}

module.exports = {
    createNoteCard,
    createDestinationCard,
    createTransportationCard,
    createGeneralCard,
    deleteCard,
    getCard,
    getCardPreview,
    updateCard
};