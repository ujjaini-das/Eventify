import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import { getEvents } from "../services/eventService";
import "./Home.css";

function Home() {
    const [events, setEvents] = useState([]);
    
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getEvents();
                setEvents(data.events);
            } catch (error) {
                console.error("Failed to fetch events:", error);
            }
        };

        fetchEvents();
    }, []);

    return (
        <>
        <section className="hero">
            <div className="hero-content">
                <p className="hero-eyebrow">
                    ✦ DISCOVER WHAT'S HAPPENING
                </p>

                <h1>
                    Moments worth
                    <span> showing up for.</span>
                </h1>

                <p className="hero-description">
                    Discover inspiring events, meet like-minded people, and turn
                    ordinary days into unforgettable experiences.
                </p>

                <div className="hero-actions">
                    <Link to="/events" className="hero-button">
                        Explore Events <span>→</span>
                    </Link>

                    <p className="hero-note">
                        Discover events curated for every kind of experience.
                    </p>
                </div>
            </div>

            <div className="hero-visual">
                <div className="hero-orb hero-orb-one"></div>
                <div className="hero-orb hero-orb-two"></div>

                <div className="hero-card">
                    <p className="hero-card-label">UP NEXT</p>

                    <h3>Find your next unforgettable experience.</h3>

                    <div className="hero-card-footer">
                        <span>Explore now</span>
                        <span>↗</span>
                    </div>
                </div>
            </div>
        </section>
        <section className="featured-events">
            <div className="featured-header">
                <div>
                    <p className="section-eyebrow">✦ CURATED FOR YOU</p>

                    <h2>
                        Experiences you
                        <span> shouldn't miss.</span>
                    </h2>
                </div>

                <Link to="/events" className="view-all-button">
                    View all events <span>→</span>
                </Link>
            </div>

            <p className="featured-description">
                Explore upcoming events, discover new experiences, and find
                something worth showing up for.
            </p>

            <div className="featured-events-grid">
                {events.slice(0, 3).map((event) => (
                    <EventCard key={event._id} event={event} />
                ))}
            </div>
        </section>
        </>
    );
}

export default Home;