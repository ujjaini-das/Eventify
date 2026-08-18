const Event = require("../models/event.model");

const getEvents = async (req, res) => {
    try{
        const { category, search } = req.query;
        const filter = {};
        if (category){
            filter.category = category;
        }
        if(search) {
            filter.title = {
                $regex: search,
                $options: "i"
            };
        }

        const events = await Event.find(filter);
        res.json(events);
    }
    catch (error) {
        res.status(500).json({
            message: "failed to fetch events"
        });
    }
};

const createEvent = async (req, res) => {
    try{
        const{ title, description, date, time, venue, category, capacity, banner } = req.body;
        const event = await Event.create({ title, description, date, time, venue, category, capacity, banner, organiser: req.user.userId });
        res.status(201).json(event);
    }
    catch (error){
        console.error("Cretated Event Error: ", error);
        res.status(500).json({
            message: "Failed to create event"
        });
    }
};

const getEventById = async (req, res) => {
    try{
        const id = req.params.id;
        const event = await Event.findById(id);
        if(!event){
            return res.status(404).json({
                message: "Event not found"
            });
        }
        res.json(event);
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
        const { title, description, date, time, venue, category, capacity, banner } = req.body;

        const updates = {};

        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (date !== undefined) updates.date = date;
        if (time !== undefined) updates.time = time;
        if (venue !== undefined) updates.venue = venue;
        if (category !== undefined) updates.category = category;
        if (capacity !== undefined) updates.capacity = capacity;
        if (banner !== undefined) updates.banner = banner;

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (event.organiser.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not allowed to modify this event"
            });
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
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }
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

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (event.organiser.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not allowed to delete this event"
            });
        }

        await Event.findByIdAndDelete(id);

        res.json({
            message: "Event deleted successfully"
        });


    } catch (error) {

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid event ID"
            });
        }
        console.error("DELETE EVENT ERROR:", error);
        res.status(500).json({
            message: "Failed to delete event"
        });
    }
};

module.exports = { getEvents, createEvent, getEventById, updateEvent, deleteEvent };