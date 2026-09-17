require("dotenv").config();

const mongoose = require("mongoose");
const crypto = require("crypto");

const Registration = require("./src/models/registration.model");

const generateTicketId = () => {
    return `EVT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

const generateTicketIds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const registrations = await Registration.find({
            $or: [
                { ticketId: { $exists: false } },
                { ticketId: null },
                { ticketId: "" }
            ]
        });

        console.log(
            `Registrations without ticket IDs: ${registrations.length}`
        );

        for (const registration of registrations) {

            let ticketId;
            let exists = true;

            while (exists) {
                ticketId = generateTicketId();

                exists = await Registration.exists({
                    ticketId
                });
            }

            await Registration.updateOne(
                { _id: registration._id },
                { $set: { ticketId } }
            );

            console.log(
                `${registration._id} → ${ticketId}`
            );
        }

        console.log("Ticket IDs generated successfully");

    } catch (error) {
        console.error("Ticket ID migration failed:", error);

    } finally {
        await mongoose.disconnect();
    }
};

generateTicketIds();