const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const trimmedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (trimmedName.length < 2 || trimmedName.length > 50) {
            return res.status(400).json({
                message: "Name must be between 2 and 50 characters"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Please provide a valid email"
            });
        }

        if (password.length < 6 || password.length > 128) {
            return res.status(400).json({
                message: "Password must be between 6 and 128 characters"
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: trimmedName,
            email: normalizedEmail,
            password: hashedPassword,
            role: role === "organiser" ? "organiser" : "user"
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        });

    } catch (error) {

        console.error("REGISTER ERROR:", error);

        res.status(500).json({
            message: "Failed to register user"
        });
    }
};

const loginUser = async (req, res) => {

    const { email, password } = req.body;

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
        email: normalizedEmail
    });
    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }
    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );
    if (!isPasswordCorrect) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }
    const token = jwt.sign(
        {
            userId: String(user._id),
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
            issuer: "eventify-api",
            audience: "eventify-client"
        }
    );
    res.json({
        message: "Login successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage
        }
    });
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage
        });

    } catch (error) {
        console.error("GET ME ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch user"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe
};