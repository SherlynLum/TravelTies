const mongoose = require('mongoose');

const tripParticipantSchema = new mongoose.Schema({
    participantUid: {
        type: String,
        required: true
    },
    
    role: { 
        type: String, 
        enum: ["creator", "admin", "member"]
    }
}, {
    _id: false
})

const joinRequestSchema = new mongoose.Schema({
    requesterUid: {
        type: String,
        required: true
    },
    
    requestTimestamp: {
        type: Date,
        required: true
    }
}, {
    _id: false
})

const tripLocationSchema = new mongoose.Schema({
    country: {
        type: String,
        required: true
    },
    
    city: {
        type: String, 
        required: true
    },
}, {
    _id: false
})

const tripSchema = new mongoose.Schema({
    joinCode: {
        type: String,
        required: true,
        unique: true
    },
    
    name: {
        type: String,
        required: true
    },

    profilePicKey: {
        type: String,
    },

    startDate: {
        type: String,
    },

    endDate: {
        type: String,
    },
    
    noOfDays: {
        type: Number,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: "Number of days must be an integer"
        }
    },

    noOfNights: {
        type: Number,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: "Number of nights must be an integer"
        }
    },

    creatorUid: {
        type: String,
        required: true
    },

    tripParticipants: {
        type: [tripParticipantSchema],
        default: [],
        validate: {
            validator: function (value) {
                return Array.isArray(value) && value.length >= 1;
            },
            message: "Trip must have at least one participant which is the trip creator"
        }
    },

    joinRequests: {
        type: [joinRequestSchema],
        default: []
    },

    isCancelled: {
        type: Boolean, 
        default: false
    },

    orderInTab: { 
        type: Map, // Use Map instead of plain Object for easier key-value manipulation with built-in methods
        of: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Card"
        }],
        default: {}
    },

    tripLocations: {
        type: [tripLocationSchema],
        default: []
    }
}, {
    timestamps: true
})

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;