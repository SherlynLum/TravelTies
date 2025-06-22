const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    initiatorUid: {
        type: String,
        required: true
    },

    deadlineDate: {
        type: String
    },

    deadlineTime: {
        type: String
    },

    isClosed: {
        type: Boolean,
        default: false
    },

    questions: { // ordered as set by the poll initiator
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
        }],
        default: []
    }
}, {
    timestamps: true
})

const Poll = mongoose.model("Poll", pollSchema);

module.exports = Poll;