const express = require('express');
const router  = express.Router();


const { getEvents, createEvent, getEventById, updateEvent, deleteEvent } = require("../controllers/event.controller");
router.get("/", getEvents);
router.post("/", createEvent);
router.get("/:id", getEventById);
router.patch("/:id", updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router;