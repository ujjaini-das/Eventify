import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Login failed");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            navigate("/");
        } catch (error) {
            console.error("Login error:", error);
            alert("Something went wrong");
        }
    };

    return (
        <main className="login-page">
            <section className="login-container">
                <div className="login-content">
                    <p className="login-label">WELCOME BACK</p>

                    <h1>
                        Continue your
                        <span> journey.</span>
                    </h1>

                    <p className="login-subtitle">
                        Sign in to discover events, register for experiences,
                        and manage your activity.
                    </p>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label>Email address</label>

                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn">
                            Sign In →
                        </button>
                    </form>

                    <p className="signup-text">
                        Don't have an account?{" "}
                        <span onClick={() => navigate("/signup")}>
                            Create one
                        </span>
                    </p>
                </div>

                <div className="login-visual">
                    <div className="login-sparkle">✦</div>

                    <div className="visual-text">
                        <p>EVENTIFY.</p>
                        <h2>
                            Discover something
                            <br />
                            worth showing up for.
                        </h2>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Login;