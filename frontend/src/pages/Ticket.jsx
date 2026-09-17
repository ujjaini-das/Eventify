import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./Ticket.css";

const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

function Ticket() {
    const { id } = useParams();

    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchRegistration = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `http://localhost:5000/api/registrations/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch ticket"
                    );
                }

                setRegistration(data);

            } catch (error) {
                console.error("Ticket error:", error);
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistration();
    }, [id]);

    if (loading) {
        return (
            <div className="ticket-state">
                Loading ticket...
            </div>
        );
    }

    if (message) {
        return (
            <div className="ticket-state">
                {message}
            </div>
        );
    }

    if (!registration || !registration.event) {
        return (
            <div className="ticket-state">
                Ticket not found.
            </div>
        );
    }

    const event = registration.event;

    const displayCategory =
        event.category === "Other" && event.customCategory
            ? event.customCategory
            : event.category;

    return (
        <main className="ticket-page">

            <Link to="/my-events" className="ticket-back">
                ← Back to My Events
            </Link>

            <div className="ticket-wrapper">

                <div className="ticket-header">
                    <p className="ticket-brand">
                        EVENTIFY<span>.</span>
                    </p>

                    <div className="ticket-status">
                        ✓ REGISTERED
                    </div>
                </div>

                <div className="ticket-category">
                    {displayCategory}
                </div>

                <h1>{event.title}</h1>

                <p className="ticket-description">
                    {event.description}
                </p>

                <div className="ticket-divider"></div>

                <div className="ticket-details">

                    <div>
                        <span>DATE</span>
                        <strong>{formatDate(event.date)}</strong>
                    </div>

                    <div>
                        <span>TIME</span>
                        <strong>{event.time}</strong>
                    </div>

                    <div>
                        <span>VENUE</span>
                        <strong>{event.venue}</strong>
                    </div>

                </div>

                <div className="ticket-id-section">
                    <span>TICKET ID</span>

                    <strong>
                        {registration.ticketId}
                    </strong>
                </div>

                <div className="ticket-qr">
                    <QRCodeSVG
                        value={registration.ticketId}
                        size={180}
                        level="H"
                    />

                    <p>Scan to verify ticket</p>
                </div>

            </div>

        </main>
    );
}

export default Ticket;