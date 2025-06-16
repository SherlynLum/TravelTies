const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    tripId: { // undefined for items inside checklist templates
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip"
    },

    type: {
        type: String,
        enum: ["task", "packing"],
        required: true
    },

    isGroupItem: {
        type: Boolean,
        required: true
    },

    creatorUid: { // meaningless to track creator if item is a group item, so left empty in that case
        type: String
    },

    name: {
        type: String,
        required: true
    },

    note: {
        type: String
    },

    dateTime: { // only for type="task"
        type: Date
    },

    earlyReminderTime: { // only for type="task"
        type: Date
    },

    isCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;