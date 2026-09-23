const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 128
    },
    role: {
        type: String,
        enum: ["user", "organiser", "admin"],
        default: "user"
    },
    profileImage: {
        type: String,
        default: ""
    },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);