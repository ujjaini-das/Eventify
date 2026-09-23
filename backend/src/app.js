const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const app = express();
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please try again later."
    }
});
app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL
    })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({
    extended: false,
    limit: "1mb"
}));

const eventRoutes = require("./routes/event.routes");
app.use("/api/events",apiLimiter, eventRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", apiLimiter, authRoutes);

const registrationRoutes = require("./routes/registration.routes");
app.use("/api/registrations", apiLimiter, registrationRoutes);
app.use((req, res) => {
    res.status(404).json({
        message: "API route not found"
    });
});
app.use((error, req, res, next) => {

    console.error("GLOBAL ERROR:", error);

    if (error instanceof multer.MulterError) {

        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "Image size must not exceed 5 MB"
            });
        }

        return res.status(400).json({
            message: "File upload failed"
        });
    }

    if (error.message === "Only image files are allowed") {
        return res.status(400).json({
            message: "Only image files are allowed"
        });
    }

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
        message:
            statusCode === 500
                ? "Internal server error"
                : error.message
    });
});

module.exports = app;