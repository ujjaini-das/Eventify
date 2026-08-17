const express = require('express');
const app = express();
app.use(express.json());

const eventRoutes = require("./routes/event.routes");
app.use("/api/events", eventRoutes);

module.exports = app;