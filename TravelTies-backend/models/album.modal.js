const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    createdByUid: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const Album = mongoose.model("Album", albumSchema);

module.exports = Album;