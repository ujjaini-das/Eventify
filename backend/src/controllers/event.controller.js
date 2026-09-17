const Event = require("../models/event.model");
const Registration = require("../models/registration.model");
const mongoose = require("mongoose");

const getEvents = async (req, res) => {
    try{
        const { category, search, page=1, limit=10 } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            !Number.isInteger(limitNumber) ||
            pageNumber < 1 ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            return res.status(400).json({
                message: "Page and limit must be valid positive integers. Limit cannot exceed 100"
            });
        }
        const filter = {};
        const skip = (pageNumber - 1) * limitNumber;
        if (category){
            filter.category = category;
        }
        if(search) {
            filter.title = {
                $regex: search,
                $options: "i"
            };
        }

        const totalEvents = await Event.countDocuments(filter);
        const totalPages = Math.ceil(totalEvents / limitNumber);
        if (pageNumber > totalPages && totalEvents > 0) {
            return res.status(404).json({
                message: "Page not found"
            });
        }
        const events = await Event.find(filter)
            .sort({ date: 1 })
            .skip(skip)
            .limit(limitNumber);
        const eventsWithRegistrationCount = events.map((event) => {
            const registrationCount = event.registeredCount || 0;

            const remainingSeats = Math.max(
                event.capacity - registrationCount,
                0
            );

            return {
                ...event.toObject(),
                registrationCount,
                remainingSeats
            };
        });

        res.json({
            events: eventsWithRegistrationCount,
            pagination: {
                totalEvents,
                totalPages,
                currentPage: pageNumber,
                limit: limitNumber
            }
        });
    }
    catch (error) {
        res.status(500).json({
            message: "failed to fetch events"
        });
    }
};

const createEvent = async (req, res) => {
    try{
        const{ title, description, date, time, venue, category,customCategory, capacity, banner } = req.body;
        const event = await Event.create({
        title,
        description,
        date,
        time,
        venue,
        category,
        customCategory,
        capacity,
        banner,
        organiser: req.user.userId
    });
        res.status(201).json(event);
    }
    catch (error){
         if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error("CREATE EVENT ERROR:", error);

        res.status(500).json({
            message: "Failed to create event"
        });
    }
};

const getEventById = async (req, res) => {
    try{
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }
        const event = await Event.findById(id);
        if(!event){
            return res.status(404).json({
                message: "Event not found"
            });
        }
        const registrationCount = await Registration.countDocuments({
            event: id
        });

        const remainingSeats = Math.max(
            event.capacity - registrationCount,
            0
        );
        res.json({ ...event.toObject(), registrationCount, remainingSeats });
    }
    catch(error){   
        if(error.name === "CastError"){
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }
        console.error("GET EVENT ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch event"
        });
    }
};

const updateEvent = async (req, res) => {
    try{
        const id = req.params.id;
                if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }
        const { title, description, date, time, venue, category,customCategory, capacity, banner } = req.body;

        const updates = {};

        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (date !== undefined) updates.date = date;
        if (time !== undefined) updates.time = time;
        if (venue !== undefined) updates.venue = venue;
        if (category !== undefined) updates.category = category;
        if (capacity !== undefined) updates.capacity = capacity;
        if (banner !== undefined) updates.banner = banner;
        if (customCategory !== undefined) updates.customCategory = customCategory;

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (event.organiser.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({
                message: "You are not allowed to modify this event"
            });
        }

        if (capacity !== undefined) {
            const registrationCount = event.registeredCount || 0;

            if (capacity < registrationCount) {
                return res.status(400).json({
                    message: "Capacity cannot be less than the current number of registrations"
                });
            }
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        res.json(updatedEvent);


    }catch (error) {
        
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }
        console.error("UPDATE EVENT ERROR:", error);
        res.status(500).json({
            message: "Failed to update event"
        });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (event.organiser.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({
                message: "You are not allowed to delete this event"
            });
        }

        await Registration.deleteMany({
            event: id
        });

        await Event.findByIdAndDelete(id);

        res.json({
            message: "Event deleted successfully"
        });


    } catch (error) {
        console.error("DELETE EVENT ERROR:", error);
        res.status(500).json({
            message: "Failed to delete event"
        });
    }
};

module.exports = { getEvents, createEvent, getEventById, updateEvent, deleteEvent };