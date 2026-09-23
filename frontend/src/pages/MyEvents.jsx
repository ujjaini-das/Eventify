import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MyEvents.css";
const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

function MyEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:5000/api/registrations/my-events",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch registered events"
                    );
                }

                setEvents(data);
            } catch (error) {
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMyEvents();
    }, []);

    const handleCancel = async (eventId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel your registration?"
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/registrations/${eventId}/register`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to cancel registration"
                );
            }

            setEvents((currentEvents) =>
                currentEvents.filter(
                    (registration) =>
                        registration.event._id !== eventId
                )
            );
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) {
        return <div className="my-events-state">Loading your events...</div>;
    }

    if (message) {
        return <div className="my-events-state">{message}</div>;
    }

    return (
        <section className="my-events-page">
            <div className="my-events-header">
                <p className="section-label">YOUR SCHEDULE</p>

                <h1>My Events.</h1>

                <p>
                    Everything you're registered for, all in one place.
                </p>
            </div>

            {events.length === 0 ? (
                <div className="empty-events">
                    <h2>No events yet.</h2>

                    <p>
                        You haven't registered for any events yet.
                    </p>

                    <Link to="/events">
                        Discover Events →
                    </Link>
                </div>
            ) : (
                <div className="my-events-grid">
                    {events.map((registration) => {
                        const event = registration.event;

                        return (
                            <article
                                className="my-event-card"
                                key={registration._id}
                            >
                                <div className="my-event-card-image">
                                    {event.banner ? (
                                        <img
                                            src={event.banner}
                                            alt={event.title}
                                            onError={(e) => {
                                                e.currentTarget.src = "/eventify.png";
                                            }}
                                        />
                                    ) : (
                                        <div className="my-event-card-placeholder">
                                            <span>✦</span>
                                            <p>EVENTIFY</p>
                                        </div>
                                    )}
                                </div>
                                <div className="my-event-category">
                                    {event.category === "Other" && event.customCategory
                                        ? event.customCategory
                                        : event.category}
                                </div>

                                <h2>{event.title}</h2>

                                <p className="my-event-description">
                                    {event.description}
                                </p>

                                <div className="my-event-meta">
                                    <span>
                                        <strong>Date</strong>
                                        {formatDate(event.date)}
                                    </span>

                                    <span>
                                        <strong>Time</strong>
                                        {event.time}
                                    </span>

                                    <span>
                                        <strong>Venue</strong>
                                        {event.venue}
                                    </span>

                                    <span>
                                        <strong>Ticket ID</strong>
                                        {registration.ticketId}
                                    </span>
                                </div>

                                <div className="my-event-actions">

                                    <Link
                                        to={`/events/${event._id}`}
                                        className="view-event-btn"
                                    >
                                        View Event →
                                    </Link>

                                    <Link
                                        to={`/tickets/${registration._id}`}
                                        className="view-ticket-btn"
                                    >
                                        View Ticket →
                                    </Link>

                                    <button
                                        className="cancel-event-btn"
                                        onClick={() =>
                                            handleCancel(event._id)
                                        }
                                    >
                                        Cancel Registration
                                    </button>

                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default MyEvents;