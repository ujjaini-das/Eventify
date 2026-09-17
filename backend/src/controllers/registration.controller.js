const Registration = require("../models/registration.model");
const Event = require("../models/event.model");
const mongoose = require("mongoose");
const crypto = require("crypto");

const generateTicketId = () => {
    return `EVT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

const registerForEvent = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const eventId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            await session.abortTransaction();

            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const event = await Event.findById(eventId).session(session);

        if (!event) {
            await session.abortTransaction();

            return res.status(404).json({
                message: "Event not found"
            });
        }

       const eventDateTime = new Date(event.date);

        const [hours, minutes] = event.time.split(":").map(Number);

        eventDateTime.setHours(hours, minutes, 0, 0);

        if (eventDateTime <= new Date()) {
            await session.abortTransaction();

            return res.status(400).json({
                message: "Registration is closed because this event has already started"
            });
        }

        if (event.organiser.toString() === req.user.userId) {
            await session.abortTransaction();

            return res.status(400).json({
                message: "You cannot register for your own event"
            });
        }

        const existingRegistration = await Registration.findOne({
            user: req.user.userId,
            event: eventId
        }).session(session);

        if (existingRegistration) {
            await session.abortTransaction();

            return res.status(409).json({
                message: "You are already registered for this event"
            });
        }

        const updatedEvent = await Event.findOneAndUpdate(
            {
                _id: eventId,
                $expr: {
                    $lt: ["$registeredCount", "$capacity"]
                }
            },
            {
                $inc: {
                    registeredCount: 1
                }
            },
            {
                new: true,
                session
            }
        );

        if (!updatedEvent) {
            await session.abortTransaction();

            return res.status(409).json({
                message: "Event is full"
            });
        }

        const registration = await Registration.create(
            [
                {
                    user: req.user.userId,
                    event: eventId,
                    ticketId: generateTicketId()
                }
            ],
            { session }
        );

        const populatedRegistration = await Registration.findById(
            registration[0]._id
        )
            .populate(
                "event",
                "title date time venue category customCategory banner"
            )
            .session(session);

        await session.commitTransaction();

        res.status(201).json({
            message: "Successfully registered for the event",
            registration: populatedRegistration
        });

    } catch (error) {

        await session.abortTransaction();

        console.error("Registration error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "You are already registered for this event"
            });
        }

        res.status(500).json({
            message: "Failed to register for the event"
        });

    } finally {
        session.endSession();
    }
};

const getMyRegisteredEvents = async (req,res) => {
    try{
        const registrations = await Registration.find({
            user: req.user.userId
        }).populate(
            "event",
            "title description date time venue category customCategory banner"
        );
        res.json(registrations);
    }catch(error){
        console.error("Get my events error:",error);
        res.status(500).json({
            message: "failed to fetch registered events"
        })
    }
};

const getEventRegistrations = async (req,res) => {
    try{
        const eventId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }
        const event = await Event.findById(eventId);
        if(!event){
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if(event.organiser.toString() !== req.user.userId && req.user.role !== "admin"){
            return res.status(403).json({
                message: "You are not authorized to view registrations for this event"
            });
        }

        const registrations = await Registration.find({
            event: eventId
        }).populate("user", "name email role");

        res.json(registrations);
    }catch(error){
        console.error("GET EVENT REGISTRATIONS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch event registrations"
        });
    }
};

const cancelRegistration = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const eventId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            await session.abortTransaction();

            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const registration = await Registration.findOne({
            user: req.user.userId,
            event: eventId
        }).session(session);

        if (!registration) {
            await session.abortTransaction();

            return res.status(404).json({
                message: "Registration not found"
            });
        }

        await Registration.findByIdAndDelete(
            registration._id,
            { session }
        );

        await Event.findOneAndUpdate(
            {
                _id: eventId,
                registeredCount: { $gt: 0 }
            },
            {
                $inc: {
                    registeredCount: -1
                }
            },
            {
                session
            }
        );

        await session.commitTransaction();

        res.json({
            message: "Registration cancelled successfully"
        });

    } catch (error) {
        await session.abortTransaction();

        console.error("CANCEL REGISTRATION ERROR:", error);

        res.status(500).json({
            message: "Failed to cancel registration"
        });

    } finally {
        session.endSession();
    }
};

const getMyRegistrationById = async (req, res) => {
    try {
        const registrationId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(registrationId)) {
            return res.status(400).json({
                message: "Invalid registration ID"
            });
        }

        const registration = await Registration.findOne({
            _id: registrationId,
            user: req.user.userId
        }).populate(
            "event",
            "title description date time venue category customCategory banner"
        );

        if (!registration) {
            return res.status(404).json({
                message: "Registration not found"
            });
        }

        res.json(registration);

    } catch (error) {
        console.error("GET REGISTRATION ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch registration"
        });
    }
};

const checkInAttendee = async (req, res) => {
    try {
        const { ticketId, eventId } = req.body;

        if (!ticketId) {
            return res.status(400).json({
                message: "Ticket ID is required"
            });
        }

        if (!eventId) {
            return res.status(400).json({
                message: "Event ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const registration = await Registration.findOne({
            ticketId: ticketId.trim().toUpperCase(),
            event: eventId
        }).populate(
            "event",
            "title organiser"
        );

        if (!registration) {
            return res.status(404).json({
                message: "Invalid ticket"
            });
        }

        if (
            registration.event.organiser.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not authorized to check in this attendee"
            });
        }

        if (registration.checkedIn) {
            return res.status(409).json({
                message: "Attendee is already checked in",
                checkedInAt: registration.checkedInAt
            });
        }

        registration.checkedIn = true;
        registration.checkedInAt = new Date();

        await registration.save();

        const populatedRegistration = await Registration.findById(
            registration._id
        )
            .populate("user", "name email")
            .populate("event", "title date time venue");

        res.json({
            message: "Attendee checked in successfully",
            registration: populatedRegistration
        });

    } catch (error) {
        console.error("CHECK-IN ERROR:", error);

        res.status(500).json({
            message: "Failed to check in attendee"
        });
    }
};

const getEventAttendance = async (req, res) => {
    try {
        const eventId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (
            event.organiser.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not authorized to view attendance"
            });
        }

        const registered = await Registration.countDocuments({
            event: eventId
        });

        const checkedIn = await Registration.countDocuments({
            event: eventId,
            checkedIn: true
        });

        const notCheckedIn = registered - checkedIn;

        const attendanceRate =
            registered === 0
                ? 0
                : Number(((checkedIn / registered) * 100).toFixed(2));

        res.json({
            eventId,
            registered,
            checkedIn,
            notCheckedIn,
            attendanceRate
        });

    } catch (error) {
        console.error("GET EVENT ATTENDANCE ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch attendance statistics"
        });
    }
};

module.exports={ registerForEvent, getMyRegisteredEvents, getEventRegistrations, cancelRegistration, generateTicketId, getMyRegistrationById, checkInAttendee, getEventAttendance };