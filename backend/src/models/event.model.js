const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 2000
    },
    date: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: "Event date must be in the future"
        }
    },
    time: {
        type: String,
        required: true,
        trim: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    venue: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 200
    },
    category: {
        type: String,
        required: true,
        enum: [
            "Hackathon",
            "Workshop",
            "Seminar",
            "Conference",
            "Cultural",
            "Sports",
            "Other"
        ]
    },
    customCategory: {
        type: String,
        trim: true,
        maxlength: 50
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 100000
    },
    registeredCount: {
        type: Number,
        default: 0,
        min: 0
    },
    banner: {
        type: String,
        default: "",
        maxlength: 1000
    },

    bannerPublicId: {
        type: String,
        default: "",
        maxlength: 300
    },
    organiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Event",eventSchema);