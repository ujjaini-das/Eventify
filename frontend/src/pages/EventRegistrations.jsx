import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./EventRegistrations.css";

function EventRegistrations() {
    const { id } = useParams();

    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [event, setEvent] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOption, setSortOption] = useState("newest");

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
            } catch (error) {
                console.error("Registration fetch error:", error);
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
            }, [id]);

            const filteredRegistrations = registrations
                .filter((registration) => {
                    const name =
                        registration.user?.name?.toLowerCase() || "";

                    const email =
                        registration.user?.email?.toLowerCase() || "";

                    const search =
                        searchTerm.toLowerCase().trim();

                    const matchesSearch =
                        name.includes(search) ||
                        email.includes(search);

                    const matchesStatus =
                        statusFilter === "all" ||
                        (statusFilter === "checked-in" &&
                            registration.checkedIn) ||
                        (statusFilter === "not-checked-in" &&
                            !registration.checkedIn);

                    return matchesSearch && matchesStatus;
                })
                .sort((a, b) => {
                    if (sortOption === "name-asc") {
                        return (a.user?.name || "").localeCompare(
                            b.user?.name || ""
                        );
                    }

                    if (sortOption === "name-desc") {
                        return (b.user?.name || "").localeCompare(
                            a.user?.name || ""
                        );
                    }

                    if (sortOption === "oldest") {
                        return new Date(a.createdAt) - new Date(b.createdAt);
                    }

                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                const checkedInCount = registrations.filter(
                    (registration) => registration.checkedIn
                ).length;

                const notCheckedInCount =
                    registrations.length - checkedInCount;

                const attendanceRate =
                    registrations.length === 0
                        ? 0
                        : Math.round(
                            (checkedInCount / registrations.length) * 100
                        );

                const handleExportCSV = () => {
                    if (filteredRegistrations.length === 0) {
                        alert("There are no attendees to export.");
                        return;
                    }

                    const headers = [
                        "Name",
                        "Email",
                        "Ticket ID",
                        "Check-in Status",
                        "Check-in Time",
                        "Registration Date"
                    ];

                    const rows = filteredRegistrations.map((registration) => [
                        registration.user?.name || "",
                        registration.user?.email || "",
                        registration.ticketId || "",
                        registration.checkedIn
                            ? "Checked In"
                            : "Not Checked In",
                        registration.checkedInAt
                            ? new Date(
                                registration.checkedInAt
                            ).toLocaleString("en-IN")
                            : "",
                        registration.createdAt
                            ? new Date(
                                registration.createdAt
                            ).toLocaleString("en-IN")
                            : ""
                    ]);

                    const csvContent = [
                        headers,
                        ...rows
                    ]
                        .map((row) =>
                            row
                                .map((value) =>
                                    `"${String(value).replace(/"/g, '""')}"`
                                )
                                .join(",")
                        )
                        .join("\n");

                    const blob = new Blob(
                        [csvContent],
                        { type: "text/csv;charset=utf-8;" }
                    );

                    const url = URL.createObjectURL(blob);

                    const link = document.createElement("a");

                    link.href = url;
                    link.download = "eventify-registrations.csv";

                    document.body.appendChild(link);
                    link.click();

                    document.body.removeChild(link);

                    URL.revokeObjectURL(url);
                };

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

                        {event && (
                            <div className="registration-event-details">

                                <div className="registration-event-banner">
                                    {event.banner ? (
                                        <img
                                            src={event.banner}
                                            alt={event.title}
                                            onError={(e) => {
                                                e.currentTarget.src = "/eventify.png";
                                            }}
                                        />
                                    ) : (
                                        <div className="registration-event-banner-placeholder">
                                            <span>✦</span>
                                        </div>
                                    )}
                                </div>

                                <div className="registration-event-content">
                                    <h2>{event.title}</h2>

                                    <div className="registration-event-meta">
                                        <span>
                                            {new Date(event.date).toLocaleDateString(
                                                "en-IN",
                                                {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                }
                                            )}
                                        </span>

                                        <span>{event.time}</span>

                                        <span>{event.venue}</span>

                                        <span>
                                            {event.category === "Other" &&
                                            event.customCategory
                                                ? event.customCategory
                                                : event.category}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        )}
                        <div className="registration-quick-actions">

                            <Link
                                to={`/dashboard/events/${id}/attendance`}
                                className="registration-attendance-link"
                            >
                                View Attendance →
                            </Link>

                            <Link
                                to={`/scanner/${id}`}
                                className="registration-scanner-link"
                            >
                                Scan Tickets →
                            </Link>

                        </div>
                </div>

                <Link to="/dashboard" className="back-dashboard-btn">
                    ← Dashboard
                </Link>
            </div>

            <div className="registrations-summary">
                <strong>{filteredRegistrations.length}</strong>

                <span>
                    {searchTerm || statusFilter !== "all"
                        ? `of ${registrations.length} Registered Attendees`
                        : "Registered Attendees"}
                </span>
            </div>

            <div className="registration-attendance-summary">

                <div className="attendance-summary-card">
                    <span>Total Registered</span>
                    <strong>{registrations.length}</strong>
                </div>

                <div className="attendance-summary-card checked">
                    <span>Checked In</span>
                    <strong>{checkedInCount}</strong>
                </div>

                <div className="attendance-summary-card pending">
                    <span>Not Checked In</span>
                    <strong>{notCheckedInCount}</strong>
                </div>

                <div className="attendance-summary-card rate">
                    <span>Attendance Rate</span>
                    <strong>{attendanceRate}%</strong>
                </div>

            </div>

            <div className="registration-attendance-progress">

                <div className="registration-progress-header">
                    <span>Attendance Progress</span>
                    <strong>{attendanceRate}%</strong>
                </div>

                <div className="registration-progress-track">
                    <div
                        className="registration-progress-fill"
                        style={{
                            width: `${attendanceRate}%`
                        }}
                    ></div>
                </div>

            </div>
                        
            <div className="registration-search">

                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    className="registration-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Attendees</option>
                    <option value="checked-in">Checked In</option>
                    <option value="not-checked-in">
                        Not Checked In
                    </option>
                </select>

                <select
                    className="registration-sort-filter"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="newest">
                        Newest Registration
                    </option>

                    <option value="oldest">
                        Oldest Registration
                    </option>

                    <option value="name-asc">
                        Name A → Z
                    </option>

                    <option value="name-desc">
                        Name Z → A
                    </option>
                </select>

                <button
                    className="clear-registration-search"
                    onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setSortOption("newest");
                    }}
                >
                    Clear
                </button>

                <button
                    className="export-registrations-btn"
                    onClick={handleExportCSV}
                >
                    ↓ Export CSV
                </button>

            </div>

            {registrations.length === 0 ? (
                <div className="registrations-empty">
                    <h2>No registrations yet.</h2>
                    <p>
                        Once people register for your event, they will appear
                        here.
                    </p>
                </div>
            ) : filteredRegistrations.length === 0 ? (
                <div className="registrations-empty">
                    <h2>No attendees found.</h2>
                    <p>
                        Try changing your search.
                    </p>
                </div>
            ) : (
                <div className="registrations-list">
                    {filteredRegistrations.map((registration) => (
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

                                <span className="registration-ticket">
                                    {registration.ticketId}
                                </span>
                            </div>

                            <div className="registration-status-wrapper">

                                <div
                                    className={
                                        registration.checkedIn
                                            ? "registration-status checked-in"
                                            : "registration-status not-checked-in"
                                    }
                                >
                                    {registration.checkedIn
                                        ? "✓ Checked In"
                                        : "Not Checked In"}
                                </div>

                                {registration.checkedIn && registration.checkedInAt && (
                                    <span className="registration-checkin-time">
                                        {new Date(
                                            registration.checkedInAt
                                        ).toLocaleString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "numeric",
                                            minute: "2-digit"
                                        })}
                                    </span>
                                )}

                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default EventRegistrations;