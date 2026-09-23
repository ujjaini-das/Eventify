import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateEvent.css";

function CreateEvent() {
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

    const [image, setImage] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setImage(null);
            return;
        }

        setImage(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const token = localStorage.getItem("token");

            const data = new FormData();

            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("date", formData.date);
            data.append("time", formData.time);
            data.append("venue", formData.venue);
            data.append("category", formData.category);
            data.append(
                "customCategory",
                formData.customCategory || ""
            );
            data.append("capacity", formData.capacity);

            if (formData.banner) {
                data.append("banner", formData.banner);
            }

            if (image) {
                data.append("image", image);
            }

            const response = await fetch(
                "http://localhost:5000/api/events",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: data,
                }
            );

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(
                    responseData.message || "Failed to create event"
                );
            }

            navigate("/dashboard");

        } catch (error) {
            setMessage(error.message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="create-event-page">
            <div className="create-event-container">
                <div className="create-event-heading">
                    <p className="section-label">
                        ORGANIZER SPACE
                    </p>

                    <h1>Create an Event.</h1>

                    <p>
                        Share your event with the community and start
                        accepting registrations.
                    </p>
                </div>

                <form
                    className="create-event-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label>Event Title</label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Web Development Workshop"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Tell people what your event is about..."
                            rows="5"
                            required
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
                            placeholder="e.g. KIIT Campus"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>

                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a category</option>
                                <option value="Hackathon">Hackathon</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Seminar">Seminar</option>
                                <option value="Conference">Conference</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Sports">Sports</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {formData.category === "Other" && (
                        <div className="form-group">
                            <label>Please specify the category</label>

                            <input
                                type="text"
                                name="customCategory"
                                value={formData.customCategory}
                                onChange={handleChange}
                                placeholder="Enter event category"
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
                                placeholder="e.g. 100"
                                min="1"
                                required
                            />
                        </div>

                    <div className="form-group">
                        <label>Event Banner (Optional)</label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />

                        <small>
                            Upload JPG, PNG, or WebP image. Maximum size: 5 MB.
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Or use Banner URL (Optional)</label>

                        <input
                            type="text"
                            name="banner"
                            value={formData.banner}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </div>

                    {message && (
                        <p className="form-message">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="create-submit-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Event..."
                            : "Create Event →"}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default CreateEvent;