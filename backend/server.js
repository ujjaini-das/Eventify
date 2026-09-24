require("dotenv").config();

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured");
    process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
    console.error("JWT_SECRET must be at least 32 characters long");
    process.exit(1);
}

const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`server running on port ${PORT}`);
});