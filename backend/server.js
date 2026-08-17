require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

app.listen(5000, ()=>{
    console.log("server running on port 5000");
});