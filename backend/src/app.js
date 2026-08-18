const express = require('express');
const app = express();
app.use(express.json());

const eventRoutes = require("./routes/event.routes");
app.use("/api/events", eventRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

module.exports = app;