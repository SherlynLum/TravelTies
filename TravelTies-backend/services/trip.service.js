const Trip = require("../models/trip.model.js");
const {customAlphabet} = require("nanoid");
const MAX_ATTEMPT = 5;
const ALPHABETS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789" // remove "O" "0" "I" "1" "l" as they are too similar and may cause confusion

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

const getTripByUid = async (uid) => {
    const trips = await Trip.aggregate([
        {
            $match: {
                "tripParticipants.participantUid": uid,
                isCancelled: false
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
                hasBothDates: {$and: [{$ne: ["$startDate", null]}, {$ne: ["$endDate", null]}]},
                sortDate: {$cond: {if: {
                    $and: [{$ne: ["$startDate", null]}, {$ne: ["$endDate", null]}]
                }, 
                then: ["$startDate", "$endDate"],
                else: {
                    $cond: {
                        if: {
                            $ne: ["$startDate", null]
                        }, then: ["$startDate"], else: ["$endDate"]
                    }
                }
            }}
            }
        },
        {
            $sort: {
                hasBothDates: -1, sortDate: 1, updatedAt: -1
            }
        }
    ])
    return trips;
}

module.exports = {
    generateJoinCode,
    createTrip,
    getTripByUid
};