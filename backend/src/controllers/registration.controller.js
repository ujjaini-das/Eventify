const Registration = require("../models/registration.model");
const Event = require("../models/event.model");

const registerForEvent = async(req, res) => {
    try{
        const eventId = req.params.id;
        const event = await Event.findById(eventId);
        if(!event){
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const existingRegistration = await Registration.findOne({
            user: req.user.userId,
            event: eventId
        });

        if(existingRegistration){
            return res.status(400).json({
                message: "you are already registered for this event"
            });
        }

        const registrationCount = await Registration.countDocuments({
            event: eventId
        });

        if(registrationCount >= event.capacity){
            return res.status(400).json({
                message: "Event is full"
            });
        }

        const registration = await Registration.create({
            user: req.user.userId,
            event: eventId
        });

        res.status(201).json({
            message: "Successfully registered for the event",
            registration
        });
    }catch(error){
        console.error("Registration error: ",error);
        res.status(500).json({
            message: "failed to registered for the event"
        });
    }
};

module.exports={ registerForEvent };