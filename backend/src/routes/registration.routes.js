const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const {
    registerForEvent,
    getMyRegisteredEvents,
    getEventRegistrations,
    cancelRegistration,
    getMyRegistrationById,
    checkInAttendee,
    getEventAttendance
} = require("../controllers/registration.controller");

router.get("/my-events", protect, getMyRegisteredEvents);

router.get("/:id/registrations", protect, getEventRegistrations);

router.get( "/event/:id/attendance", protect, authorizeRoles("organiser", "admin"), getEventAttendance );

router.get("/:id", protect, getMyRegistrationById);

router.post("/:id/register", protect, registerForEvent);

router.delete("/:id/register", protect, cancelRegistration);
router.post( "/check-in", protect, authorizeRoles("organiser", "admin"), checkInAttendee);

module.exports = router;