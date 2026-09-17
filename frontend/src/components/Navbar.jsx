import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser ? JSON.parse(savedUser) : null;
    });

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);

        navigate("/");
    };

    return (
        <nav className="navbar">
            <Link to="/" className="logo">
                EVENTIFY<span>.</span>
            </Link>

            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/events">Discover</Link>
            </div>

            <div className="nav-actions">
                {user ? (
                    <>
                        {user.role === "organiser" && (
                            <Link to="/dashboard" className="my-events-link">
                                My Dashboard
                            </Link>
                        )}

                        <Link to="/my-events" className="my-events-link">
                            My Events
                        </Link>

                        <span className="user-name">
                            Hi, {user.name}
                        </span>

                        <button
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                                    <>
                        <Link
                            to="/login"
                            className="login-link"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="register-button"
                        >
                            Get Started <span>↗</span>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;