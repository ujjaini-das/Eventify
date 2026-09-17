import { Link } from "react-router-dom";
import "./EventCard.css";

function EventCard({ event }) {
    const formattedDate = new Date(event.date).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
    const eventDate = new Date(event.date);
        const today = new Date();

        eventDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        let eventStatus = "UPCOMING";

        if (eventDate.getTime() === today.getTime()) {
            eventStatus = "TODAY";
        } else if (eventDate < today) {
            eventStatus = "COMPLETED";
        }

    const displayCategory =
        event.category === "Other" && event.customCategory
            ? event.customCategory
            : event.category;

    return (
        <article className="event-card">

            <div className="event-card-image">
                {event.banner ? (
                    <img
                        src={event.banner}
                        alt={event.title}
                    />
                ) : (
                    <div className="event-card-placeholder">
                        <span>✦</span>
                        <p>EVENTIFY</p>
                    </div>
                )}
            </div>

            <div className="event-card-content">

                <div className="event-card-meta">
                    <p className="event-category">
                        {displayCategory}
                    </p>

                    <span className={`event-status ${eventStatus.toLowerCase()}`}>
                        {eventStatus}
                    </span>
                </div>

                <h3>{event.title}</h3>

                <div className="event-info">

                    <p>
                        📅 {formattedDate}
                    </p>

                    <p>
                        ⏰ {event.time}
                    </p>

                    <p>
                        📍 {event.venue}
                    </p>

                </div>

                <div className="event-card-footer">

                    <span className="event-seats">
                        {event.remainingSeats > 0
                            ? `${event.remainingSeats} spots left`
                            : "Event Full"}
                    </span>

                    <Link
                        to={`/events/${event._id}`}
                        className="discover-link"
                    >
                        Discover event →
                    </Link>

                </div>

            </div>

        </article>
    );
}

export default EventCard;