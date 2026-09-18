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
            const [searchTerm, setSearchTerm] = useState("");
            const [statusFilter, setStatusFilter] = useState("all");
            const [sortOption, setSortOption] = useState("newest");

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

       const filteredAttendees = attendees
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

    const handleExportCSV = () => {
            if (attendees.length === 0) {
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

            const rows = filteredAttendees.map((registration) => [
                registration.user?.name || "",
                registration.user?.email || "",
                registration.ticketId || "",
                registration.checkedIn
                    ? "Checked In"
                    : "Not Checked In",
                registration.checkedInAt
                    ? new Date(registration.checkedInAt).toLocaleString("en-IN")
                    : "",
                registration.createdAt
                    ? new Date(registration.createdAt).toLocaleString("en-IN")
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
            link.download = "eventify-attendees.csv";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        };

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

                    <div className="attendance-event-details">

                        <h2>
                            {attendance.event.title}
                        </h2>

                        <div className="attendance-event-meta">

                            <span>
                                {new Date(attendance.event.date).toLocaleDateString(
                                    "en-IN",
                                    {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                    }
                                )}
                            </span>

                            <span>
                                {attendance.event.time}
                            </span>

                            <span>
                                {attendance.event.venue}
                            </span>

                            <span>
                                {attendance.event.category === "Other" &&
                                attendance.event.customCategory
                                    ? attendance.event.customCategory
                                    : attendance.event.category}
                            </span>

                        </div>

                    </div>
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
                                {filteredAttendees.length} of {attendees.length} attendees
                            </span>

                            <button
                                className="attendance-export-btn"
                                onClick={handleExportCSV}
                            >
                                ↓ Export CSV
                            </button>

                            <button
                                className="attendance-refresh-btn"
                                onClick={fetchAttendance}
                                disabled={refreshing}
                            >
                                {refreshing ? "Refreshing..." : "↻ Refresh"}
                            </button>

                        </div>

                </div>

                <div className="attendee-filters">

                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Attendees</option>
                            <option value="checked-in">Checked In</option>
                            <option value="not-checked-in">Not Checked In</option>
                        </select>

                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="newest">Newest Registration</option>
                            <option value="oldest">Oldest Registration</option>
                            <option value="name-asc">Name A → Z</option>
                            <option value="name-desc">Name Z → A</option>
                        </select>

                        <button
                            className="clear-filters-btn"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                                setSortOption("newest");
                            }}
                        >
                            Clear
                        </button>

                    </div>

                {attendees.length === 0 ? (
                        <div className="attendees-empty">
                            <p>No one has registered for this event yet.</p>
                        </div>
                    ) : filteredAttendees.length === 0 ? (
                        <div className="attendees-empty">
                            <p>No attendees found.</p>
                            <span>
                                Try changing your search or filter.
                            </span>
                        </div>
                    ) : (
                        <div className="attendees-list">

                            {filteredAttendees.map((registration) => (
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