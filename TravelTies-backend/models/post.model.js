const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    commenterUid: {
        type: String,
        required: true
    },
    
    text: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        required: true
    }
}, {
    _id: false
})

const sharedItineraryConsentSchema = new mongoose.Schema({
    buddiesUid: {
        type: String,
        required: true
    },
    
    status: {
        type: String,
        enum: ["pending", "approved", "declined"],
        required: true
    }
}, {
    _id: false
})

const postSchema = new mongoose.Schema({
    authorUid: {
        type: String,
        required: true
    },

    text: { 
        type: String
    },

    photoKeys: { // AWS S3 keys 
        type: [String]
    },

    likes: {
        type: Number,
        min: 0,
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: "Number of likes must be an integer"
        }
    },

    comments: {
        type: [commentSchema],
        default: []
    },

    tripId: { // present only if the post includes a shared itinerary
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip"
    },

    sharedItineraryConsents: {
        type: [sharedItineraryConsentSchema],
        default: []
    }
}, {
    timestamps: true
})

const Post = mongoose.model("Post", postSchema);

module.exports = Post;