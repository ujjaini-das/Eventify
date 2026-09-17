require("dotenv").config();

const mongoose = require("mongoose");
const Event = require("./src/models/event.model");
const Registration = require("./src/models/registration.model");

const syncRegistrationCounts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const events = await Event.find().select("_id title");

        for (const event of events) {
            const count = await Registration.countDocuments({
                event: event._id
            });

            await Event.updateOne(
                { _id: event._id },
                {
                    $set: {
                        registeredCount: count
                    }
                }
            );

            console.log(
                `${event.title}: registeredCount = ${count}`
            );
        }

        console.log(
            "Registration counts synchronized successfully"
        );

    } catch (error) {
        console.error("Sync failed:", error);

    } finally {
        await mongoose.disconnect();
    }
};

syncRegistrationCounts();