const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: true
    },

    uploadedByUid: {
        type: String, 
        required: true
    },

    key: { // AWS S3 key for the uploaded photo
        type: String, 
        required: true
    },

    albumId: { // a photo can belongs to multiple albums or no album
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album"
        }],
        default: []
    }
}, {
    timestamps: true
})

const Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;