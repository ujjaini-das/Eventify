import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./EventRegistrations.css";

function EventRegistrations() {
    const { id } = useParams();

    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `http://localhost:5000/api/registrations/${id}/registrations`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch registrations"
                    );
                }

                setRegistrations(data);
            } catch (error) {
                console.error("Registration fetch error:", error);
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, [id]);

    if (loading) {
        return (
            <div className="registration-state">
                Loading registrations...
            </div>
        );
    }

    if (message) {
        return (
            <div className="registration-state">
                <h2>Something went wrong.</h2>
                <p>{message}</p>
            </div>
        );
    }

    return (
        <section className="registrations-page">
            <div className="registrations-header">
                <div>
                    <p className="section-label">EVENT MANAGEMENT</p>
                    <h1>Registrations.</h1>
                    <p>
                        View everyone who has registered for this event.
                    </p>
                </div>

                <Link to="/dashboard" className="back-dashboard-btn">
                    ← Dashboard
                </Link>
            </div>

            <div className="registrations-summary">
                <strong>{registrations.length}</strong>
                <span>Registered Attendees</span>
            </div>

            {registrations.length === 0 ? (
                <div className="registrations-empty">
                    <h2>No registrations yet.</h2>
                    <p>
                        Once people register for your event, they will appear
                        here.
                    </p>
                </div>
            ) : (
                <div className="registrations-list">
                    {registrations.map((registration) => (
                        <article
                            className="registration-card"
                            key={registration._id}
                        >
                            <div className="attendee-avatar">
                                {registration.user?.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="attendee-info">
                                <h2>
                                    {registration.user?.name ||
                                        "Unknown User"}
                                </h2>

                                <p>
                                    {registration.user?.email ||
                                        "No email available"}
                                </p>
                            </div>

                            <div className="registration-role">
                                {registration.user?.role}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default EventRegistrations;