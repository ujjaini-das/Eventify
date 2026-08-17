const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true,
        trim: true
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
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    banner: {
        type: String,
        default: ""
    },
    Organiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Event",eventSchema);