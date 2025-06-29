const mongoose = require('mongoose');

const checklistTemplateSchema = new mongoose.Schema({
    creatorUid: { // undefined for built-in templates
        type: String
    },

    title: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["task", "packing"],
        required: true
    },

    itemIds: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        }],
        
        default: []
    }
}, {
    timestamps: true
})

const ChecklistTemplate = mongoose.model("ChecklistTemplate", checklistTemplateSchema);

module.exports = ChecklistTemplate;