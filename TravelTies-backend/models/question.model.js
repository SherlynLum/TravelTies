const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    pollId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll",
        required: true
    },

    questionText: {
        type: String,
        required: true
    },

    minChoices: {
        type: Number,
        min: 0,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: "Minimum number of choices must be an integer"
        }
    },

    maxChoices: {
        type: Number,
        min: 0,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: "Maximum number of choices must be an integer"
        }
    },

    category: {
        type: String,
        enum: ["destination", "accommodation", "transportation", "food_and_drink", "attraction"]
    },

    options: { // ordered as set by the poll initiator
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Option",
        }],
        default: []
    }
}, {
    timestamps: true
})

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;