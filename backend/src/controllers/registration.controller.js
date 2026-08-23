const Registration = require("../models/registration.model");
const Event = require("../models/event.model");
const mongoose = require("mongoose");

const registerForEvent = async(req, res) => {
    try{
        const eventId = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(eventId)){
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
        if (event.organiser.toString() === req.user.userId) {
            return res.status(400).json({
                message: "You cannot register for your own event"
            });
        }
        const existingRegistration = await Registration.findOne({
            user: req.user.userId,
            event: eventId
        });

        if(existingRegistration){
            return res.status(409).json({
                message: "You are already registered for this event"
            });
        }

        const registrationCount = await Registration.countDocuments({
            event: eventId
        });

        if(registrationCount >= event.capacity){
            return res.status(409).json({
                message: "Event is full"
            });
        }

        const registration = await Registration.create({
            user: req.user.userId,
            event: eventId
        });

        const populatedRegistration = await registration.populate("event", "title date time venue category");
        res.status(201).json({
            message: "Successfully registered for the event",
            registration: populatedRegistration
        });
    }catch(error){
        console.error("Registration error: ",error);
        res.status(500).json({
            message: "failed to registered for the event"
        });
    }
};

const getMyRegisteredEvents = async (req,res) => {
    try{
        const registrations = await Registration.find({
            user: req.user.userId
        }).populate("event", "title description date time venue category banner");
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

const cancelRegistration = async (req,res) => {
    try{
        const eventId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }
        const registration = await Registration.findOne({
            user: req.user.userId,
            event: eventId
        });
        if(!registration){
            return res.status(404).json({
                message: "Registration not found"
            });
        }

        await Registration.findByIdAndDelete(registration._id);
        res.json({
            message: "Registration cancelled successfully"
        });
    }catch(error){
        console.error("CANCEL REGISTRATION ERROR:", error);

        res.status(500).json({
            message: "Failed to cancel registration"
        });
    }
};

module.exports={ registerForEvent, getMyRegisteredEvents, getEventRegistrations, cancelRegistration };