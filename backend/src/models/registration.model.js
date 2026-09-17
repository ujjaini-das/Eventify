const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },

    ticketId: {
        type: String,
        unique: true,
        index: true
    },

    checkedIn: {
        type: Boolean,
        default: false
    },

    checkedInAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

// Prevent duplicate registration for the same user and event
registrationSchema.index(
    { user: 1, event: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "Registration",
    registrationSchema
);