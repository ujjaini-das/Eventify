const express = require("express");

const router = express.Router();

const {
    getEvents,
    createEvent,
    getEventById,
    updateEvent,
    deleteEvent
} = require("../controllers/event.controller");

const { protect } = require("../middleware/auth.middleware");

router.get("/", getEvents);
router.get("/:id", getEventById);

router.post("/", protect, createEvent);

router.patch("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

module.exports = router;