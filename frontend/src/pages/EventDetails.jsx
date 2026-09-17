import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EventDetails.css";
const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};


const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    const [registered, setRegistered] = useState(false);
    const [registering, setRegistering] = useState(false);

    const userData = localStorage.getItem("user");
    let currentUser = null;
    try {
        currentUser = userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error("Invalid user data in localStorage");
    }

    useEffect(() => {
        const fetchEventAndRegistration = async () => {
            try {
                const eventResponse = await fetch(
                    `http://localhost:5000/api/events/${id}`
                );

                const eventData = await eventResponse.json();

                if (!eventResponse.ok) {
                    throw new Error(
                        eventData.message || "Failed to fetch event"
                    );
                }

                setEvent(eventData);

                const token = localStorage.getItem("token");

                if (token) {
                    const registrationResponse = await fetch(
                        "http://localhost:5000/api/registrations/my-events",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    const registrationData =
                        await registrationResponse.json();

                    if (registrationResponse.ok) {
                        const alreadyRegistered =
                            registrationData.some(
                                (registration) =>
                                    registration.event?._id === id
                            );

                        setRegistered(alreadyRegistered);
                    }
                }

            } catch (error) {
                console.error(
                    "Error fetching event:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndRegistration();
    }, [id]);

    const handleRegister = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first");
            navigate("/login");
            return;
        }

        try {
            setRegistering(true);

            const response = await fetch(
                `http://localhost:5000/api/registrations/${id}/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Registration failed");
                return;
            }

            alert("Successfully registered for the event!");

            setRegistered(true);

            setEvent((prevEvent) => ({
                ...prevEvent,
                registrationCount: (prevEvent.registrationCount || 0) + 1,
                remainingSeats: Math.max(prevEvent.remainingSeats - 1, 0),
            }));

        } catch (error) {
            console.error("Registration error:", error);
            alert("Something went wrong");
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return <h2>Loading...</h2>;
    }

    if (!event) {
        return <h2>Event not found</h2>;
    }

   const eventDateTime = new Date(event.date);

    const [hours, minutes] = event.time.split(":").map(Number);

    eventDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();

    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let eventStatus = "UPCOMING";

    if (eventDateTime <= now) {
        eventStatus = "COMPLETED";
    } else if (eventDate.getTime() === today.getTime()) {
        eventStatus = "TODAY";
    }

    return (
        <main className="event-details">

            <section className="event-details-hero">

                <div className="event-details-content">

                    <div className="event-details-meta-top">
                        <p className="event-details-category">
                            ✦ {event.category === "Other" && event.customCategory
                                ? event.customCategory
                                : event.category}
                        </p>

                        <span className={`event-status ${eventStatus.toLowerCase()}`}>
                            {eventStatus}
                        </span>
                    </div>

                    <h1>{event.title}</h1>

                    <p className="event-details-description">
                        {event.description}
                    </p>

                    <div className="event-details-meta">

                        <div>
                            <span>DATE</span>
                            <p>
                                {formatDate(event.date)}
                            </p>
                        </div>

                        <div>
                            <span>TIME</span>
                            <p>{event.time}</p>
                        </div>

                        <div>
                            <span>VENUE</span>
                            <p>{event.venue}</p>
                        </div>

                    </div>

                </div>

                <div className="event-details-visual">

                    {event.banner ? (
                        <img
                            src={event.banner}
                            alt={event.title}
                        />
                    ) : (
                        <div className="event-details-placeholder">
                            <span>✦</span>
                        </div>
                    )}

                </div>

            </section>


            <section className="event-details-info">

                <div className="event-about">

                    <p className="section-label">
                        ABOUT THE EVENT
                    </p>

                    <h2>
                        Everything you need to know.
                    </h2>

                    <p>{event.description}</p>

                </div>


                <aside className="event-capacity-card">

                    <p>EVENT CAPACITY</p>

                    <h3>{event.capacity}</h3>

                    <span>
                        {event.remainingSeats} spots remaining
                    </span>

                    <button
                        className="register-btn"
                        onClick={handleRegister}
                        disabled={
                            registered ||
                            registering ||
                            event.remainingSeats <= 0 ||
                            eventStatus === "COMPLETED" ||
                            currentUser?.id === event.organiser
                        }
                    >
                        {registering
                        ? "Registering..."
                        : registered
                        ? "Registered ✓"
                        : currentUser?.id === event.organiser
                        ? "Your Event"
                        : eventStatus === "COMPLETED"
                        ? "Event Completed"
                        : event.remainingSeats <= 0
                        ? "Event Full"
                        : "Register for Event →"}
                    </button>

                </aside>

            </section>

        </main>
    );
};

export default EventDetails;