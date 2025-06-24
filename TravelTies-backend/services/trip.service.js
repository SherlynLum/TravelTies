const Trip = require("../models/trip.model.js");
const {customAlphabet} = require("nanoid");
const MAX_ATTEMPT = 5;
const ALPHABETS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789" // remove "O" "0" "I" "1" "l" as they are too similar and may cause confusion
const {ObjectId} = require("mongodb");
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
        for (let i = 1; i <= noOfDays; i++) {
            orderInTab[`day ${i}`] = [];
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
            uid: "$participantsProfiles.uid",
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

const updateOverview = async ({id, name, profilePicKey, startDate, endDate, noOfDays, 
    noOfNights}) => {
        const updatedTrip = await Trip.findByIdAndUpdate(
            id,
            {$set: {
                name, profilePicKey, startDate, endDate, noOfDays, noOfNights
            }},
            {new: true, runValidators: true});
        return updatedTrip;
}

const updateParticipants = async ({id, tripParticipants}) => {
    const updatedTrip = await Trip.findByIdAndUpdate(
        id,
        {$set: {tripParticipants}},
        {new: true, runValidators: true});
    return updatedTrip;
}

// for accepted join requests
const addParticipants = async ({id, acceptedRequests, session}) => {
    const updatedTrip = await Trip.findByIdAndUpdate(
        id,
        {$push: {tripParticipants: {$each: acceptedRequests}}},
        {new: true, runValidators: true, session});
    return updatedTrip;
}

const removeAcceptedRequests = async ({id, acceptedRequests, session}) => {
    const acceptedUids = acceptedRequests.map(participant => participant.participantUid);
    const updatedTrip = await Trip.findByIdAndUpdate(
        id,
        {$pull: {joinRequests: {requesterUid: {$in: acceptedUids}}}},
        {new: true, runValidators: true, session});
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
                analyzer: "searchCaseInsensitive",
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
                analyzer: "searchCaseInsensitive",
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

module.exports = {
    generateJoinCode,
    createTrip,
    getTripsByUid,
    getTripsInBin,
    getOverview,
    getParticipants,
    getJoinRequests,
    isCreator,
    hasAdminRights,
    isParticipant,
    updateOverview,
    updateParticipants,
    addParticipants,
    removeAcceptedRequests,
    cancelTrip,
    restoreTrip,
    deleteTrip,
    searchActiveTrips,
    searchBinTrips
};