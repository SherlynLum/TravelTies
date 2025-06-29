const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    voterUid: {
        type: String,
        required: true
    },

    pollId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll",
        required: true
    },

    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },
    
    selectedOptionIds: { // length depends on the question minChoices and maxChoices requirement
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Option"
        }],
        default: []
    }
}, {
    timestamps: true
})

// adding index to ensure that each user only has one response for each question and also for faster query
voteSchema.index({ voterUid: 1, questionId: 1 }, { unique: true });

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;