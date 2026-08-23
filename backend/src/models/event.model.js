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
                return value > newDate();
            },
            message: "Event date must be in the future"
        }
    },
    time: {
        type: String,
        required: true
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
    capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 100000
    },
    banner: {
        type: String,
        default: ""
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