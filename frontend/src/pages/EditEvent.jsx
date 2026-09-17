import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditEvent.css";

function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        category: "",
        customCategory: "",
        capacity: "",
        banner: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `http://localhost:5000/api/events/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch event"
                    );
                }

                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    date: data.date
                        ? data.date.split("T")[0]
                        : "",
                    time: data.time || "",
                    venue: data.venue || "",
                    category: data.category || "",
                    customCategory: data.customCategory || "",
                    capacity: data.capacity || "",
                    banner: data.banner || "",
                });
            } catch (error) {
                console.error("Fetch event error:", error);
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/events/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update event"
                );
            }

            setMessage("Event updated successfully!");

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (error) {
            console.error("Update event error:", error);
            setMessage(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="edit-event-state">
                Loading event...
            </div>
        );
    }

    if (message && !formData.title) {
        return (
            <div className="edit-event-state">
                <h2>Unable to load event.</h2>
                <p>{message}</p>
            </div>
        );
    }

    return (
        <section className="edit-event-page">
            <div className="edit-event-header">
                <div>
                    <p className="section-label">EVENT MANAGEMENT</p>

                    <h1>Edit Event.</h1>

                    <p>
                        Update the details of your event and save
                        your changes.
                    </p>
                </div>

                <button
                    className="back-dashboard-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Dashboard
                </button>
            </div>

            <form
                className="edit-event-form"
                onSubmit={handleSubmit}
            >
                <div className="form-group">
                    <label>Event Title</label>

                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        minLength="3"
                        maxLength="100"
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        minLength="10"
                        maxLength="2000"
                        rows="6"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Date</label>

                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Time</label>

                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Venue</label>

                    <input
                        type="text"
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        required
                        minLength="2"
                        maxLength="200"
                    />
                </div>

                <div className="form-group">
                    <label>Category</label>

                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select a category
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
                </div>

                {formData.category === "Other" && (
                    <div className="form-group">
                        <label>
                            Please specify the category
                        </label>

                        <input
                            type="text"
                            name="customCategory"
                            value={formData.customCategory}
                            onChange={handleChange}
                            placeholder="e.g. Tech Meetup"
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label>Capacity</label>

                    <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        required
                        min="1"
                        max="100000"
                    />
                </div>

                <div className="form-group">
                    <label>Banner URL</label>

                    <input
                        type="url"
                        name="banner"
                        value={formData.banner}
                        onChange={handleChange}
                        placeholder="https://example.com/banner.jpg"
                    />
                </div>

                <button
                    type="submit"
                    className="save-event-btn"
                    disabled={saving}
                >
                    {saving
                        ? "Saving Changes..."
                        : "Save Changes →"}
                </button>

                {message && (
                    <p className="edit-event-message">
                        {message}
                    </p>
                )}
            </form>
        </section>
    );
}

export default EditEvent;