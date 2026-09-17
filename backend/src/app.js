const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const app = express();
app.use(helmet());
app.use(
    cors({
        origin: "http://localhost:5173"
    })
);
app.use(express.json({ limit: "1mb" }));


const eventRoutes = require("./routes/event.routes");
app.use("/api/events", eventRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

const registrationRoutes = require("./routes/registration.routes");
app.use("/api/registrations", registrationRoutes);
app.use((req, res) => {
    res.status(404).json({
        message: "API route not found"
    });
});
app.use((error, req, res, next) => {
    console.error("GLOBAL ERROR:", error);

    res.status(error.statusCode || 500).json({
        message: error.message || "Internal server error"
    });
});
module.exports = app;