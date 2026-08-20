const express = require("express");
const router = express.Router();
const { authorizeRoles } = require("../middleware/role.middleware");
const { protect } = require("../middleware/auth.middleware");
const { getEvents, createEvent, getEventById, updateEvent, deleteEvent } = require("../controllers/event.controller");

router.get("/", getEvents);
router.get("/:id", getEventById);

router.post("/", protect, authorizeRoles("organiser", "admin"), createEvent);
router.patch("/:id", protect, authorizeRoles("organiser", "admin"),updateEvent);
router.delete("/:id", protect, authorizeRoles("organiser", "admin"), deleteEvent);

module.exports = router;