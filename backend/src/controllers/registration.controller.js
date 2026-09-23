const Registration = require("../models/registration.model");
const Event = require("../models/event.model");
const mongoose = require("mongoose");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

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
            .populate(
                "user",
                "name email"
            )
            .session(session);

        await session.commitTransaction();

        try {
            await sendEmail({
                to: populatedRegistration.user.email,
                subject: `Registration Confirmed - ${populatedRegistration.event.title}`,
                html: `
                    <div style="
                        margin: 0;
                        padding: 40px 20px;
                        background: #f5f5f5;
                        font-family: Arial, Helvetica, sans-serif;
                    ">

                        <div style="
                            max-width: 600px;
                            margin: 0 auto;
                            background: #ffffff;
                            border-radius: 16px;
                            overflow: hidden;
                            border: 1px solid #e5e5e5;
                        ">

                            <!-- Header -->

                            <div style="
                                padding: 28px 32px;
                                border-bottom: 1px solid #eeeeee;
                            ">
                                <h1 style="
                                    margin: 0;
                                    font-size: 24px;
                                    color: #111111;
                                ">
                                    Eventify
                                </h1>

                                <p style="
                                    margin: 6px 0 0;
                                    color: #777777;
                                    font-size: 13px;
                                ">
                                    Experiences worth remembering.
                                </p>
                            </div>


                            <!-- Main Content -->

                            <div style="
                                padding: 32px;
                            ">

                                <div style="
                                    display: inline-block;
                                    padding: 7px 12px;
                                    background: #f0fdf4;
                                    color: #15803d;
                                    border-radius: 20px;
                                    font-size: 12px;
                                    font-weight: bold;
                                ">
                                    REGISTRATION CONFIRMED
                                </div>

                                <h2 style="
                                    margin: 20px 0 10px;
                                    font-size: 28px;
                                    color: #111111;
                                ">
                                    You're all set! 🎉
                                </h2>

                                <p style="
                                    color: #555555;
                                    font-size: 15px;
                                    line-height: 1.7;
                                ">
                                    Hello <strong>${populatedRegistration.user.name}</strong>,
                                </p>

                                <p style="
                                    color: #555555;
                                    font-size: 15px;
                                    line-height: 1.7;
                                ">
                                    Your registration for
                                    <strong>${populatedRegistration.event.title}</strong>
                                    has been successfully confirmed.
                                </p>


                                <!-- Event Details -->

                                <div style="
                                    margin-top: 28px;
                                    padding: 22px;
                                    background: #fafafa;
                                    border: 1px solid #eeeeee;
                                    border-radius: 12px;
                                ">

                                    <h3 style="
                                        margin: 0 0 18px;
                                        font-size: 16px;
                                        color: #111111;
                                    ">
                                        Event Details
                                    </h3>

                                    <p style="
                                        margin: 10px 0;
                                        color: #555555;
                                        font-size: 14px;
                                    ">
                                        <strong>Date:</strong>
                                        ${new Date(
                                            populatedRegistration.event.date
                                        ).toLocaleDateString("en-IN")}
                                    </p>

                                    <p style="
                                        margin: 10px 0;
                                        color: #555555;
                                        font-size: 14px;
                                    ">
                                        <strong>Time:</strong>
                                        ${populatedRegistration.event.time}
                                    </p>

                                    <p style="
                                        margin: 10px 0;
                                        color: #555555;
                                        font-size: 14px;
                                    ">
                                        <strong>Venue:</strong>
                                        ${populatedRegistration.event.venue}
                                    </p>

                                </div>


                                <!-- Ticket -->

                                <div style="
                                    margin-top: 24px;
                                    padding: 24px;
                                    text-align: center;
                                    background: #111111;
                                    border-radius: 12px;
                                ">

                                    <p style="
                                        margin: 0 0 10px;
                                        color: #aaaaaa;
                                        font-size: 12px;
                                        text-transform: uppercase;
                                        letter-spacing: 1px;
                                    ">
                                        Your Ticket ID
                                    </p>

                                    <p style="
                                        margin: 0;
                                        color: #ffffff;
                                        font-size: 24px;
                                        font-weight: bold;
                                        letter-spacing: 2px;
                                    ">
                                        ${populatedRegistration.ticketId}
                                    </p>

                                </div>


                                <p style="
                                    margin-top: 24px;
                                    color: #666666;
                                    font-size: 13px;
                                    line-height: 1.6;
                                ">
                                    Please keep your Ticket ID safe. It will be used
                                    during event check-in.
                                </p>

                                <p style="
                                    margin-top: 28px;
                                    color: #555555;
                                    font-size: 14px;
                                ">
                                    Thank you for choosing Eventify.
                                </p>

                            </div>


                            <!-- Footer -->

                            <div style="
                                padding: 20px 32px;
                                background: #fafafa;
                                border-top: 1px solid #eeeeee;
                            ">

                                <p style="
                                    margin: 0;
                                    color: #999999;
                                    font-size: 12px;
                                    line-height: 1.5;
                                ">
                                    This is an automated email from Eventify.
                                    Please do not reply to this email.
                                </p>

                            </div>

                        </div>

                    </div>
                `
            });
        } catch (emailError) {
            console.error(
                "Registration successful, but confirmation email failed:",
                emailError.message
            );
        }

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

       if (
            event.organiser.toString() !== String(req.user.userId) &&
            req.user.role !== "admin"
        ) {
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
        })
            .populate(
                "user",
                "name email"
            )
            .populate(
                "event",
                "title date time venue category customCategory"
            )
            .session(session);

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

        try {
            await sendEmail({
                to: registration.user.email,
                subject: `Registration Cancelled - ${registration.event.title}`,
                html: `
                    <div style="
                        margin: 0;
                        padding: 40px 20px;
                        background: #f5f5f5;
                        font-family: Arial, Helvetica, sans-serif;
                    ">

                        <div style="
                            max-width: 600px;
                            margin: 0 auto;
                            background: #ffffff;
                            border-radius: 16px;
                            overflow: hidden;
                            border: 1px solid #e5e5e5;
                        ">

                            <!-- Header -->

                            <div style="
                                padding: 28px 32px;
                                border-bottom: 1px solid #eeeeee;
                            ">
                                <h1 style="
                                    margin: 0;
                                    font-size: 24px;
                                    color: #111111;
                                ">
                                    Eventify
                                </h1>

                                <p style="
                                    margin: 6px 0 0;
                                    color: #777777;
                                    font-size: 13px;
                                ">
                                    Experiences worth remembering.
                                </p>
                            </div>


                            <!-- Main Content -->

                            <div style="
                                padding: 32px;
                            ">

                                <div style="
                                    display: inline-block;
                                    padding: 7px 12px;
                                    background: #fef2f2;
                                    color: #dc2626;
                                    border-radius: 20px;
                                    font-size: 12px;
                                    font-weight: bold;
                                ">
                                    REGISTRATION CANCELLED
                                </div>

                                <h2 style="
                                    margin: 20px 0 10px;
                                    font-size: 28px;
                                    color: #111111;
                                ">
                                    Registration Cancelled
                                </h2>

                                <p style="
                                    color: #555555;
                                    font-size: 15px;
                                    line-height: 1.7;
                                ">
                                    Hello <strong>${registration.user.name}</strong>,
                                </p>

                                <p style="
                                    color: #555555;
                                    font-size: 15px;
                                    line-height: 1.7;
                                ">
                                    Your registration for
                                    <strong>${registration.event.title}</strong>
                                    has been successfully cancelled.
                                </p>


                                <!-- Event Details -->

                                <div style="
                                    margin-top: 28px;
                                    padding: 22px;
                                    background: #fafafa;
                                    border: 1px solid #eeeeee;
                                    border-radius: 12px;
                                ">

                                    <h3 style="
                                        margin: 0 0 18px;
                                        font-size: 16px;
                                        color: #111111;
                                    ">
                                        Event Details
                                    </h3>

                                    <p style="
                                        margin: 10px 0;
                                        color: #555555;
                                        font-size: 14px;
                                    ">
                                        <strong>Date:</strong>
                                        ${new Date(
                                            registration.event.date
                                        ).toLocaleDateString("en-IN")}
                                    </p>

                                    <p style="
                                        margin: 10px 0;
                                        color: #555555;
                                        font-size: 14px;
                                    ">
                                        <strong>Time:</strong>
                                        ${registration.event.time}
                                    </p>

                                    <p style="
                                        margin: 10px 0;
                                        color: #555555;
                                        font-size: 14px;
                                    ">
                                        <strong>Venue:</strong>
                                        ${registration.event.venue}
                                    </p>

                                </div>


                                <p style="
                                    margin-top: 24px;
                                    color: #666666;
                                    font-size: 13px;
                                    line-height: 1.6;
                                ">
                                    Your ticket is no longer valid for this event.
                                    You can register again if registrations are still open
                                    and seats are available.
                                </p>

                                <p style="
                                    margin-top: 28px;
                                    color: #555555;
                                    font-size: 14px;
                                ">
                                    Thank you for using Eventify.
                                </p>

                            </div>


                            <!-- Footer -->

                            <div style="
                                padding: 20px 32px;
                                background: #fafafa;
                                border-top: 1px solid #eeeeee;
                            ">

                                <p style="
                                    margin: 0;
                                    color: #999999;
                                    font-size: 12px;
                                    line-height: 1.5;
                                ">
                                    This is an automated email from Eventify.
                                    Please do not reply to this email.
                                </p>

                            </div>

                        </div>

                    </div>
                `
            });
        } catch (emailError) {
            console.error(
                "Registration cancelled, but cancellation email failed:",
                emailError.message
            );
        }

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
        
        if (
            typeof ticketId !== "string" ||
            !ticketId.trim()
        ) {
            return res.status(400).json({
                message: "Valid Ticket ID is required"
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
            registration.event.organiser.toString() !== String(req.user.userId) &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not authorized to check in this attendee"
            });
        }
        
        const checkInTime = new Date();

        const updatedRegistration = await Registration.findOneAndUpdate(
            {
                _id: registration._id,
                checkedIn: false
            },
            {
                $set: {
                    checkedIn: true,
                    checkedInAt: checkInTime
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedRegistration) {
            const existingRegistration = await Registration.findById(
                registration._id
            ).select("checkedIn checkedInAt");

            return res.status(409).json({
                message: "Attendee is already checked in",
                checkedInAt: existingRegistration?.checkedInAt || null
            });
        }

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

        const event = await Event.findById(eventId).select(
            "title description date time venue category customCategory banner organiser"
        );

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (
            event.organiser.toString() !== String(req.user.userId) &&
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
            event: {
                title: event.title,
                description: event.description,
                date: event.date,
                time: event.time,
                venue: event.venue,
                category: event.category,
                customCategory: event.customCategory,
                banner: event.banner
            },
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