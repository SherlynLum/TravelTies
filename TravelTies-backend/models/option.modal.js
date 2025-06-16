const mongoose = require('mongoose');

const accommodationOptionalFieldSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 0
    },
    
    maxRating: {
        type: Number,
        min: 0
    },

    ratingCount: { // number of reviews
        type: Number,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: "Number of reviews must be an integer"
        }
    },

    roomType: {
        type: String
    },

    cancellationPolicy: {
        type: String,
        enum: ["fully cancellable and reschedulable", "non-refundable, can reschedule", 
            "non-refundable, non-reschedulable"]
    },

    amenities: {
        type: [String],
        enum: ["breakfast included", "toiletries", "minibar", "mini fridge", "hair dryer", 
            "coffee maker", "iron", "safe", "free wifi", "air conditioning", "air purifier",
            "television", "desk", "parking", "gym", "swimming pool", "spa", "laundry services",
            "pet-friendly"],
        default: []
    }
}, {
    _id: false
})

const transportationOptionalFieldSchema = new mongoose.Schema({
    departureDateTime: {
        type: Date
    },

    departureTimezone: {
        type: String
    },

    arrivalDateTime: {
        type: Date
    },

    arrivalTimezone: {
        type: String
    },

    duration: { // in minutes
        type: Number,
        min: 0,
        validate: {
            validation: Number.isInteger,
            message: "Duration must be an integer"
        }
    },

    seatType: {
        type: String
    },

    mealIncluded: {
        type: Boolean
    },

    freeLuggageAllowance: { // units will be displayed in UI
        type: Number,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: "Free luggage allowance must be an integer"
        }
    },

    cancellationPolicy: {
        type: String,
        enum: ["fully cancellable and reschedulable", "non-refundable, can reschedule", 
            "non-refundable, non-reschedulable"]
    }
}, {
    _id: false
})

const foodAndDrinkOptionalFieldSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 0
    },
    
    maxRating: {
        type: Number,
        min: 0
    },

    ratingCount: { // number of reviews
        type: Number,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: "Number of reviews must be an integer"
        }
    }
}, {
    _id: false
})


const optionSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    },

    category: {
        type: String,
        enum: ["destination", "accommodation", "transportation", "food_and_drink", "attraction"]
    },

    name: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    price: { // Allow free-form string input for price such as SGD 100
        type: String
    },

    url: {
        type: String
    },

    accommodationOptionalFields: { // only for category="accommodation"
        type: accommodationOptionalFieldSchema
    },

    transportationOptionalFields: { // only for category="transportation"
        type: transportationOptionalFieldSchema
    },

    foodAndDrinkOptionalFields: { // only for category="food_and_drink"
        type: foodAndDrinkOptionalFieldSchema
    }
}, {
    timestamps: true
})

const Option = mongoose.model("Option", optionSchema);

module.exports = Option;