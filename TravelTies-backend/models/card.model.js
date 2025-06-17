const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: true
    },

    cardType: {
        type: String,
        enum: ["note", "destination", "accommodation", "transportation", "food_and_drink", "attraction", "others"],
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    startDateTime: {
        type: Date
    },

    startTimezone: {
        type: String
    },

    endDateTime: {
        type: Date
    },

    endTimezone: {
        type: String
    },

    generalAddress: { // exclude cardType="transportation" || "destination" || "note"
        type: String
    },

    departureAddress: { // only for cardType="transportation"
        type: String
    },

    arrivalAddress: { // only for cardType="transportation"
        type: String
    },

    country: { // only for cardType="destination"
        type: String
    },

    city: { // only for cardType="destination"
        type: String
    },

    picIDs: { 
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Photo"
        }],
        default: []
    },

    docKeys: { // array of AWS S3 keys to access uploaded documents
        type: [String],
        default: []
    }
}, {
    timestamps: true
})

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;