const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    uid:{
        type: String,
        required: true
    },
    
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: "Rating must be an integer"
        }
    }
}, {
    timestamps: true
})

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;