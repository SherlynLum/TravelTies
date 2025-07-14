const Trip = require("../models/trip.model.js");
const {customAlphabet} = require("nanoid");
const MAX_ATTEMPT = 5;
const ALPHABETS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789" // remove "O" "0" "I" "1" "l" as they are too similar and may cause confusion
const {ObjectId} = require("mongodb");
const { getCardPreview } = require("./itinerary.service.js");
const SEARCH_RES_LIMIT = 10;

const generateJoinCode = async () => {
    const nanoid = customAlphabet(ALPHABETS, 8);
    for (let i = 0; i < MAX_ATTEMPT; i++) {
        const code = nanoid();
        const existingTrip = await Trip.exists({joinCode: code});
        if (!existingTrip) {
            return code;
        }
    }
    throw new Error("Problem generating unique Join Code");
}

const createTrip = async ({uid, joinCode, name, profilePicKey, startDate, endDate, noOfDays,
    noOfNights, tripParticipants}) => {
        // initialise orderInTab
        const orderInTab = {"unscheduled": []};
        if (noOfDays) {
            for (let i = 1; i <= noOfDays; i++) {
                orderInTab[`day ${i}`] = [];
            }
        }

        const newTrip = await Trip.create({joinCode, name, profilePicKey, startDate, endDate, 
            noOfDays, noOfNights, creatorUid: uid, tripParticipants, orderInTab});
        return newTrip;
}

const getTripsByUid = async (uid) => {
    const trips = await Trip.aggregate([
        {$match: {
            "tripParticipants.participantUid": uid,
            isCancelled: false
            }
        }, 
        {$project: {
            name: 1,
            profilePicKey: 1,
            startDate: 1,
            endDate: 1, 
            noOfDays: 1,
            noOfNights: 1,
            noOfParticipants: {$size: "$tripParticipants"},
        }}
    ]);
    return trips;
}

const getTripsInBin = async (uid) => {
    const trips = await Trip.aggregate([
        {
            $match: {
                creatorUid: uid,
                isCancelled: true
            }
        },
        {
            $project: {
                name: 1,
                profilePicKey: 1,
                startDate: 1,
                endDate: 1, 
                noOfDays: 1,
                noOfNights: 1,
                noOfParticipants: {$size: "$tripParticipants"},
                noDates: {$and: [{$not: {$gt: [{$strLenCP: {$ifNull: ["$startDate", ""]}}, 0]}},
                    {$not: {$gt: [{$strLenCP: {$ifNull: ["$endDate", ""]}}, 0]}}]} // 1 if no startDate and endDate, 0 if have both startDate and endDate
            }
        },
        {
            $sort: {
                noDates: 1, startDate: 1, endDate: 1, updatedAt: -1
            }
        }
    ])
    return trips;
}

const getOverview = async (tripId) => {
    const tripOverview = await Trip.findOne({_id: tripId}, 
        {
            name: 1,
            profilePicKey: 1,
            startDate: 1,
            endDate: 1, 
            noOfDays: 1,
            noOfNights: 1,
            noOfParticipants: {$size: "$tripParticipants"},
        })
    return tripOverview;
}

const getJoinCode = async (tripId) => {
    const trip = await Trip.findById(tripId, {joinCode: 1})
    return trip;
}

const getParticipants = async (tripId) => {
    const tripExists = await Trip.exists({_id: tripId});
    if (!tripExists) {
        throw new Error("No trip is found");
    }
    const participants = await Trip.aggregate([
        {$match: {_id: new ObjectId(tripId)}},
        {$unwind: "$tripParticipants"},
        {$lookup: {
            from: "users",
            localField: "tripParticipants.participantUid",
            foreignField: "uid",
            as: "participantsProfiles"
        }},
        {$unwind: "$participantsProfiles"},
        {$project: {
            _id: 0,
            participantUid: "$participantsProfiles.uid",
            username: "$participantsProfiles.username",
            profilePicKey: "$participantsProfiles.profilePicKey",
            role: "$tripParticipants.role",
            roleOrder: {$switch:{
                branches: [
                    {case: {$eq: ["$tripParticipants.role", "creator"]}, then: 1},
                    {case: {$eq: ["$tripParticipants.role", "admin"]}, then: 2},
                    {case: {$eq: ["$tripParticipants.role", "member"]}, then: 3},
                ]
            }}
        }},
        {$sort: {roleOrder: 1, username: 1}}, // order is going to messed up during addParticipants, so need to sort again
        {$project: {
            roleOrder: 0
        }}
    ]).collation({locale: "en", strength: 2});
    return participants;
}

const getJoinRequests = async (tripId) => {
    const joinRequests = await Trip.aggregate([
        {$match: {_id: new ObjectId(tripId)}},
        {$unwind: "$joinRequests"},
        {$lookup: {
            from: "users",
            localField: "joinRequests.requesterUid",
            foreignField: "uid",
            as: "requestersProfiles"
        }},
        {$unwind: "$requestersProfiles"},
        {$project: {
            _id: 0,
            uid: "$requestersProfiles.uid",
            username: "$requestersProfiles.username",
            profilePicKey: "$requestersProfiles.profilePicKey",
            requestAt: "$joinRequests.requestTimestamp"
        }},
        {$sort: {requestAt: 1}} // order is going to messed up during add join request, so need to sort again
    ]);
    return joinRequests;
}

const isCreator = async ({uid, tripId}) => {
    const trip = await Trip.findOne({
        _id: tripId, creatorUid: uid
    });
    return !!trip;
}

const hasAdminRights = async ({uid, tripId}) => {
    const trip = await Trip.findOne({
        _id: tripId,
        tripParticipants: {$elemMatch: {
            participantUid: uid,
            role: {$in: ["creator", "admin"]}
        }}
    });
    return !!trip;
}


const isParticipant = async ({uid, tripId}) => {
    const trip = await Trip.findOne({
        _id: tripId,
        "tripParticipants.participantUid": uid
    });
    return !!trip;
}

const updateOrderInTab = ({oldOrderInTab, oldNoOfDays, newNoOfDays}) => {
    const prevNoOfDays = oldNoOfDays || 0;
    const updatedNoOfDays = newNoOfDays || 0;
    if (prevNoOfDays < updatedNoOfDays) {
        for (let i = prevNoOfDays + 1; i <= updatedNoOfDays; i++) {
            oldOrderInTab[`day ${i}`] = [];
        }
    } else if (prevNoOfDays > updatedNoOfDays) {
        for (let i = updatedNoOfDays + 1; i <= prevNoOfDays; i++) {
            const toBeMoved = oldOrderInTab[`day ${i}`];
            oldOrderInTab["unscheduled"].push(...toBeMoved);
            delete oldOrderInTab[`day ${i}`];
        }
    }
    return oldOrderInTab;
}

const updateTrip = async ({id, name, profilePicKey, startDate, endDate, noOfDays, 
    noOfNights, tripParticipants}) => {
        const currentTrip = await Trip.findById(id, {orderInTab: 1, noOfDays: 1, _id: 0});
        if (!currentTrip) {
            throw new Error("No trip is found");
        }
        let orderInTab;
        orderInTab = currentTrip.orderInTab;
        const oldNoOfDays = currentTrip.noOfDays;
        if (oldNoOfDays !== noOfDays) {
            orderInTab = updateOrderInTab({oldOrderInTab: orderInTab, oldNoOfDays, newNoOfDays: noOfDays});
        }

        const updatedTrip = await Trip.findByIdAndUpdate(
            id,
            {$set: {
                name, profilePicKey, startDate, endDate, noOfDays, noOfNights, tripParticipants, 
                orderInTab
            }},
            {new: true, runValidators: true});
        return updatedTrip;
}

const addParticipantsAndRemoveFromRequests = async ({id, acceptedRequests, declinedUids}) => {
    const acceptedUids = acceptedRequests.map(participant => participant.participantUid);
    const uidsToBeRemoved = [...acceptedUids, ...declinedUids];
    const updatedTrip = await Trip.findByIdAndUpdate(
        id,
        {$pull: {joinRequests: {requesterUid: {$in: uidsToBeRemoved}}},
        $push: {tripParticipants: {$each: acceptedRequests}}},
        {new: true, runValidators: true});
    return updatedTrip;
}

const cancelTrip = async (id) => {
    const updatedTrip = await Trip.findByIdAndUpdate(
        id,
        {$set: {isCancelled: true}},
        {new: true, runValidators: true}
    );
    return updatedTrip
}

const restoreTrip = async (id) => {
    const updatedTrip = await Trip.findByIdAndUpdate(
        id,
        {$set: {isCancelled: false}},
        {new: true, runValidators: true}
    );
    return updatedTrip
}

const deleteTrip = async (id) => {
    const deletedTrip = await Trip.findByIdAndDelete(id);
    return deletedTrip
}

const searchActiveTrips = async ({uid, searchTerm}) => {
    if (!searchTerm) {
        return [];
    }

    const searchResults = await Trip.aggregate([
        {$search: {
            index: "tripNameSearch",
            text: {
                query: searchTerm,
                path: "name",
                fuzzy: {
                    maxEdits: 2,
                    prefixLength: 1
                }
            }
        }},
        {$match: {
            "tripParticipants.participantUid": uid,
            isCancelled: false
        }},
        {$project: {
            name: 1,
            profilePicKey: 1,
            startDate: 1,
            endDate: 1, 
            noOfDays: 1,
            noOfNights: 1,
            noOfParticipants: {$size: "$tripParticipants"}
        }},
        {$limit: SEARCH_RES_LIMIT}
    ]);
    return searchResults;
}

const searchBinTrips = async ({uid, searchTerm}) => {
    if (!searchTerm) {
        return [];
    }

    const searchResults = await Trip.aggregate([
        {$search: {
            index: "tripNameSearch",
            text: {
                query: searchTerm,
                path: "name",
                fuzzy: {
                    maxEdits: 2,
                    prefixLength: 1
                }
            }
        }},
        {$match: {
            creatorUid: uid,
            isCancelled: true
        }},
        {$project: {
            name: 1,
            profilePicKey: 1,
            startDate: 1,
            endDate: 1, 
            noOfDays: 1,
            noOfNights: 1,
            noOfParticipants: {$size: "$tripParticipants"}
        }},
        {$limit: SEARCH_RES_LIMIT}
    ]);
    return searchResults;
}

const addJoinRequest = async ({uid, joinCode}) => {
    const trip = await Trip.findOne({joinCode}, {tripParticipants: 1, joinRequests: 1});
    if (!trip) {
        throw new Error("No trip is found");
    }

    const hasJoined = trip.tripParticipants.some(participant => participant.participantUid === uid);
    if (hasJoined) 
        throw new Error("This user has already joined this trip")

    const hasRequested = trip.joinRequests.some(requester => requester.requesterUid === uid);
    if (hasRequested) {
        throw new Error("This user has already requested to join this trip");
    }

    const requestTimestamp = new Date();
    const updatedTrip = await Trip.findOneAndUpdate({joinCode},
        {$push: {joinRequests: {
            requesterUid: uid,
            requestTimestamp
        }}},
        {new: true, runValidators: true}
    )
    return updatedTrip;
}
 
const removeBuddy = async ({uid, tripId}) => {
    const updatedTrip = await Trip.findByIdAndUpdate(tripId, {
        $pull: {tripParticipants: {uid}}
    }, {new: true, runValidators: true});
    return updatedTrip;
}

const addCard = async ({tripId, cardId, startDate, endDate, session}) => {
    const trip = await Trip.findById(tripId, {orderInTab: 1}).session(session);
    if (!trip) {
        throw new Error("No trip is found");
    }

    // all the inner if should not happen based on my implementation, here is just for safety
    if (startDate && !endDate) {
        if (!trip.orderInTab[`day ${startDate}`]) {
            // later might need to revisit when allows collaboration 
            // this is because trip startDate and endDate might be changed by other members 
            // might consider moving this card to unscheduled in this case
            throw new Error(`Day ${startDate} tab does not exist`); 
        }
        trip.orderInTab[`day ${startDate}`].push(cardId);
    } else if (endDate && !startDate) {
        if (!trip.orderInTab[`day ${endDate}`]) {
            throw new Error(`Day ${endDate} tab does not exist`);
        }
        trip.orderInTab[`day ${endDate}`].push(cardId);
    } else if (!startDate && !endDate) {
        if (!trip.orderInTab["unscheduled"]) { 
            trip.orderInTab["unscheduled"] = []; 
        }
        trip.orderInTab["unscheduled"].push(cardId);
    } else if (startDate && endDate) {
        for (let i = startDate; i <= endDate; i++) {
            if (!trip.orderInTab[`day ${i}`]) {
                throw new Error(`Day ${i} tab does not exist`);
            }
            trip.orderInTab[`day ${i}`].push(cardId);
        }
    }

    await trip.save({session});
    return trip;
}

const getCards = async ({tripId, tab}) => {
    const trip = await Trip.findById(tripId, {orderInTab: 1});
    if (!trip) {
        throw new Error("No trip is found");
    }
    const cardIds = trip.orderInTab[tab];
    if (!Array.isArray(cardIds)){
        throw new Error(`Tab ${tab} is not found`)
    }
    const cards = await Promise.all(
        cardIds.map(async (cardId) => {
            const card = await getCardPreview(cardId);
            if (!card) {
                throw new Error(`Card with ID ${cardId} is not found`);
            }
            return card;
        })
    )
    return cards;
}

const removeCard = async ({tripId, cardId, session}) => {
    const trip = await Trip.findById(tripId, {orderInTab: 1}).session(session);
    if (!trip) {
        throw new Error("No trip is found");
    }

    for (const tab in trip.orderInTab) {
        if (Array.isArray(trip.orderInTab[tab])) {
            trip.orderInTab[tab] = trip.orderInTab[tab].filter(id => !id.equals(cardId));
        }
    }

    await trip.save({session});
    return trip;
}

module.exports = {
    generateJoinCode,
    createTrip,
    getTripsByUid,
    getTripsInBin,
    getOverview,
    getJoinCode,
    getParticipants,
    getJoinRequests,
    isCreator,
    hasAdminRights,
    isParticipant,
    updateTrip,
    addParticipantsAndRemoveFromRequests,
    cancelTrip,
    restoreTrip,
    deleteTrip,
    searchActiveTrips,
    searchBinTrips,
    addJoinRequest,
    removeBuddy,
    addCard,
    getCards,
    removeCard
};