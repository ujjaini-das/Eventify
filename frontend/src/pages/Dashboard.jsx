import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

function Dashboard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [attendance, setAttendance] = useState({});

    useEffect(() => {
            const fetchEvents = async () => {
                try {
                    const token = localStorage.getItem("token");

                    const savedUser = JSON.parse(
                        localStorage.getItem("user")
                    );

                    const response = await fetch(
                        "http://localhost:5000/api/events",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.message || "Failed to fetch events"
                        );
                    }

                    const organizerEvents = data.events.filter(
                        (event) =>
                            event.organiser === savedUser.id
                    );

                    setEvents(organizerEvents);

                    const attendanceData = {};

                    for (const event of organizerEvents) {

                        const attendanceResponse = await fetch(
                            `http://localhost:5000/api/registrations/event/${event._id}/attendance`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (attendanceResponse.ok) {
                            attendanceData[event._id] =
                                await attendanceResponse.json();
                        }
                    }

                    setAttendance(attendanceData);

                } catch (error) {
                    console.error(
                        "Dashboard error:",
                        error
                    );

                    setMessage(error.message);

                } finally {
                    setLoading(false);
                }
            };

            fetchEvents();
        }, []);

    if (loading) {
        return (
            <div className="dashboard-state">
                Loading your dashboard...
            </div>
        );
    }

    if (message) {
        return (
            <div className="dashboard-state">
                {message}
            </div>
        );
    }

    const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
    );

    if (!confirmed) {
        return;
    }

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:5000/api/events/${eventId}`,
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
                data.message || "Failed to delete event"
            );
        }

        setEvents((currentEvents) =>
            currentEvents.filter(
                (event) => event._id !== eventId
            )
        );

    } catch (error) {
        console.error("Delete event error:", error);
        setMessage(error.message);
    }
    };

    return (
        <section className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <p className="section-label">
                        ORGANIZER SPACE
                    </p>

                    <h1>My Dashboard.</h1>

                    <p>
                        Manage your events and keep track of registrations.
                    </p>
                </div>

                <Link
                    to="/create-event"
                    className="create-event-btn"
                >
                    Create Event <span>↗</span>
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="dashboard-empty">
                    <h2>No events created yet.</h2>

                    <p>
                        Start creating experiences for your community.
                    </p>

                    <Link
                        to="/create-event"
                        className="create-event-btn"
                    >
                        Create Your First Event →
                    </Link>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {events.map((event) => (
                        <article
                            className="dashboard-card"
                            key={event._id}
                        >
                            <p className="dashboard-category">
                                {event.category === "Other" && event.customCategory
                                    ? event.customCategory
                                    : event.category}
                            </p>

                            <h2>{event.title}</h2>

                            <p className="dashboard-description">
                                {event.description}
                            </p>

                            <div className="dashboard-stats">

                                <div>
                                    <strong>
                                        {event.registrationCount || 0}
                                    </strong>
                                    <span>Registered</span>
                                </div>

                                <div>
                                    <strong>
                                        {event.remainingSeats}
                                    </strong>
                                    <span>Spots Left</span>
                                </div>

                                <div>
                                    <strong>
                                        {event.capacity}
                                    </strong>
                                    <span>Capacity</span>
                                </div>

                                <div>
                                    <strong>
                                        {attendance[event._id]?.checkedIn || 0}
                                    </strong>
                                    <span>Checked In</span>
                                </div>

                                <div>
                                    <strong>
                                        {attendance[event._id]?.notCheckedIn || 0}
                                    </strong>
                                    <span>Not Checked In</span>
                                </div>

                                <div>
                                    <strong>
                                        {attendance[event._id]?.attendanceRate || 0}%
                                    </strong>
                                    <span>Attendance</span>
                                </div>

                            </div>

                            <div className="attendance-progress">

                                <div className="attendance-progress-header">
                                    <span>Attendance</span>

                                    <strong>
                                        {attendance[event._id]?.attendanceRate || 0}%
                                    </strong>
                                </div>

                                <div className="attendance-progress-track">
                                    <div
                                        className="attendance-progress-fill"
                                        style={{
                                            width: `${attendance[event._id]?.attendanceRate || 0}%`
                                        }}
                                    ></div>
                                </div>

                                <p className="attendance-summary">
                                    {attendance[event._id]?.checkedIn || 0} of{" "}
                                    {attendance[event._id]?.registered || 0} attendees checked in
                                </p>

                            </div>

                            <div className="dashboard-meta">
                                <span>{formatDate(event.date)}</span>
                                <span>{event.time}</span>
                                <span>{event.venue}</span>
                            </div>

                            <div className="dashboard-actions">
                                <Link to={`/events/${event._id}`}>
                                    View Event →
                                </Link>

                                <Link to={`/dashboard/events/${event._id}/registrations`}>
                                    Registrations →
                                </Link>

                                <Link to={`/dashboard/events/${event._id}/attendance`}>
                                    Attendance →
                                </Link>

                                <Link to={`/scanner/${event._id}`} className="scan-ticket-link" >
                                    Scan Tickets →
                                </Link>

                                <Link to={`/dashboard/events/${event._id}/edit`}>
                                    Edit Event →
                                </Link>

                                <button
                                    className="delete-event-btn"
                                    onClick={() => handleDelete(event._id)}
                                >
                                    Delete Event
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default Dashboard;