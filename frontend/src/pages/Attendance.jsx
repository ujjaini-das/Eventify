import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Attendance.css";

        function Attendance() {
            const { id } = useParams();

            const [attendance, setAttendance] = useState(null);
            const [attendees, setAttendees] = useState([]);
            const [loading, setLoading] = useState(true);
            const [message, setMessage] = useState("");
            const [refreshing, setRefreshing] = useState(false);    

            const fetchAttendance = async () => {
            try {
                const token = localStorage.getItem("token");

                setMessage("");
                setRefreshing(true);

                const response = await fetch(
                    `http://localhost:5000/api/registrations/event/${id}/attendance`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch attendance"
                    );
                }

                setAttendance(data);

                const registrationsResponse = await fetch(
                    `http://localhost:5000/api/registrations/${id}/registrations`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const registrationsData =
                    await registrationsResponse.json();

                if (!registrationsResponse.ok) {
                    throw new Error(
                        registrationsData.message ||
                        "Failed to fetch attendees"
                    );
                }

                setAttendees(registrationsData);

            } catch (error) {
                console.error(
                    "Attendance error:",
                    error
                );

                setMessage(error.message);

            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        useEffect(() => {
            fetchAttendance();
        }, [id]);

    if (loading) {
        return (
            <div className="attendance-state">
                Loading attendance...
            </div>
        );
    }

    if (message) {
        return (
            <div className="attendance-state">
                {message}
            </div>
        );
    }

    return (
        <main className="attendance-page">

            <Link
                to="/dashboard"
                className="attendance-back"
            >
                ← Back to Dashboard
            </Link>

            <div className="attendance-header">

                <div>
                    <p className="section-label">
                        EVENT ATTENDANCE
                    </p>

                    <h1>Attendance.</h1>

                    <p>
                        Track registrations and attendee check-ins
                        for this event.
                    </p>
                </div>

                <Link
                    to={`/scanner/${id}`}
                    className="attendance-scan-btn"
                >
                    Scan Tickets →
                </Link>

            </div>

            <div className="attendance-stats">

                <div>
                    <strong>
                        {attendance.registered}
                    </strong>

                    <span>
                        Registered
                    </span>
                </div>

                <div>
                    <strong>
                        {attendance.checkedIn}
                    </strong>

                    <span>
                        Checked In
                    </span>
                </div>

                <div>
                    <strong>
                        {attendance.notCheckedIn}
                    </strong>

                    <span>
                        Not Checked In
                    </span>
                </div>

                <div>
                    <strong>
                        {attendance.attendanceRate}%
                    </strong>

                    <span>
                        Attendance Rate
                    </span>
                </div>

            </div>

            <div className="attendees-section">

                <div className="attendees-header">

                    <div>
                        <p className="section-label">
                            REGISTERED ATTENDEES
                        </p>

                        <h2>Attendee List.</h2>
                    </div>

                    <div className="attendees-header-actions">

                        <span>
                            {attendees.length} attendees
                        </span>

                        <button
                            className="attendance-refresh-btn"
                            onClick={fetchAttendance}
                            disabled={refreshing}
                        >
                             {refreshing ? "Refreshing..." : "↻ Refresh"}
                        </button>

                    </div>

                </div>

                {attendees.length === 0 ? (
                    <div className="attendees-empty">
                        <p>No one has registered for this event yet.</p>
                    </div>
                ) : (
                    <div className="attendees-list">

                        {attendees.map((registration) => (
                            <div
                                className="attendee-row"
                                key={registration._id}
                            >

                                <div className="attendee-info">

                                    <strong>
                                        {registration.user?.name}
                                    </strong>

                                    <span>
                                        {registration.user?.email}
                                    </span>

                                </div>

                                <div className="attendee-ticket">

                                    <span>
                                        {registration.ticketId}
                                    </span>

                                </div>

                                <div
                                    className={
                                        registration.checkedIn
                                            ? "attendee-status checked-in"
                                            : "attendee-status not-checked-in"
                                    }
                                >
                                    {registration.checkedIn
                                        ? "✓ Checked In"
                                        : "Not Checked In"}
                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

        </main>
    );
}

export default Attendance;