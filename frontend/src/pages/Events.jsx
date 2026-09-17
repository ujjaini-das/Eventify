import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import "./Events.css";

function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const fetchEvents = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            params.append("page", page);
            params.append("limit", 6);

            if (search.trim()) {
                params.append("search", search.trim());
            }

            if (category) {
                params.append("category", category);
            }

            const response = await fetch(
                `http://localhost:5000/api/events?${params.toString()}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch events"
                );
            }

            setEvents(data.events);
            setPagination(data.pagination);

        } catch (error) {
            console.error("Error fetching events:", error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchEvents();
    }, [page, search, category]);

    useEffect(() => {
        if (
            pagination &&
            page > pagination.totalPages &&
            pagination.totalPages > 0
        ) {
            setPage(pagination.totalPages);
        }
    }, [pagination, page]);

    const handleSearch = (event) => {
        event.preventDefault();

        setSearch(searchInput);
        setPage(1);
    };
    const handleClearSearch = () => {
        setSearchInput("");
        setSearch("");
        setCategory("");
        setPage(1);
    };

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
        setPage(1);
    };

    return (
        <div className="events-page">

            <section className="events-header">

                <p className="events-eyebrow">
                    DISCOVER EXPERIENCES
                </p>

                <h1>
                    Experiences worth
                    <span> showing up for.</span>
                </h1>

                <p>
                    Explore upcoming events, discover new experiences,
                    and find something worth showing up for.
                </p>

            </section>


            {/* Search & Filter */}

            <section className="events-controls">

                <form
                    className="events-search"
                    onSubmit={handleSearch}
                >
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchInput}
                        onChange={(event) =>
                            setSearchInput(event.target.value)
                        }
                    />

                    <button type="submit">
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={handleClearSearch}
                    >
                        Clear
                    </button>
                </form>


                <select
                    value={category}
                    onChange={handleCategoryChange}
                >
                    <option value="">
                        All Categories
                    </option>

                    <option value="Hackathon">
                        Hackathon
                    </option>

                    <option value="Workshop">
                        Workshop
                    </option>

                    <option value="Seminar">
                        Seminar
                    </option>

                    <option value="Conference">
                        Conference
                    </option>

                    <option value="Cultural">
                        Cultural
                    </option>

                    <option value="Sports">
                        Sports
                    </option>

                    <option value="Other">
                        Other
                    </option>
                </select>

            </section>


            {/* Events */}

            {loading ? (
                <div className="events-state">
                    <div className="events-loader"></div>
                    <p>Loading events...</p>
                </div>
            ) : events.length === 0 ? (

                <div className="events-state">
                    <h2>No events found.</h2>

                    <p>
                        Try a different search or category.
                    </p>

                    <button
                        className="events-reset-button"
                        onClick={handleClearSearch}
                    >
                        Clear Search
                    </button>
                </div>

            ) : (

                <div className="events-grid">

                    {events.map((event) => (
                        <EventCard
                            key={event._id}
                            event={event}
                        />
                    ))}

                </div>

            )}


            {/* Pagination */}

            {pagination && pagination.totalPages > 1 && (

                <div className="events-pagination">

                    <button
                        onClick={() =>
                            setPage((currentPage) =>
                                Math.max(currentPage - 1, 1)
                            )
                        }
                        disabled={page === 1}
                    >
                        ← Previous
                    </button>


                    <span>
                        Page {pagination.currentPage} of{" "}
                        {pagination.totalPages}
                    </span>


                    <button
                        onClick={() =>
                            setPage((currentPage) =>
                                Math.min(
                                    currentPage + 1,
                                    pagination.totalPages
                                )
                            )
                        }
                        disabled={
                            page === pagination.totalPages
                        }
                    >
                        Next →
                    </button>

                </div>

            )}

        </div>
    );
}

export default Events;