const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const{ registerForEvent, getMyRegisteredEvents, getEventRegistrations, cancelRegistration } = require("../controllers/registration.controller");
router.get("/my-events", protect, getMyRegisteredEvents);
router.get("/:id/registrations", protect, getEventRegistrations);
router.post("/:id/register", protect, registerForEvent);
router.delete("/:id/register", protect, cancelRegistration);
module.exports = router;