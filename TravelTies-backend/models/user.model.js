const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema(
    {
        friendUid: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["friends", "request_sent", "request_received"],
            required: true
        },

        requestTime: {
            type: Date,
            required: true
        },
    }, 
    {
        _id: false
    }
);

const stripeAccountSchema = new mongoose.Schema(
    {
        stripeAccountId: {
            type: String, 
            required: true
        },
        
        detailsSubmitted: {
            type: Boolean,
            required: true,
            default: false
        },

        chargesEnabled: {
            type: Boolean,
            required: true,
            default: false
        },

        payoutsEnabled: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        _id: false
    }
);

const userSchema = new mongoose.Schema(
    {
        uid:{
            type: String,
            required: true,
            unique: true
        },

        username: {
            type: String,
            unique: true,
            minlength: 3,
            maxlength: 20,
            match: /^(?!_+$)[a-zA-Z0-9_]+$/
        },

        profilePicKey: {
            type: String,
            required: false
        },

        notificationEnabled: {
            type: Boolean,
            default: true
        },

        theme: {
            type: String,
            enum: ["light", "dark", "system"],
            default: "system"
        },

        friends: {
            type: [friendSchema],
            default: []
        },

        stripeAccount: {
            type: stripeAccountSchema,
            required: false
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;