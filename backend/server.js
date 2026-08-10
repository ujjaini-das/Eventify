const express = require("express");
const app = express();

app.use(express.json());
app.get("/",(req,res)=>{
    res.send("Eventify Api is running");
});

const events = [
    {
        id: 1,
        title: "ignithon",
        category: "Hackathon",
    },
    {
        id: 2,
        title: "conquer and win",
        category: "game"
    },
    {
        id: 3,
        title: "gamified",
        category: "game",
    }
]
app.get("/api/events",(req,res)=>{
    res.json(events);
});

app.post("/api/events", (req,res)=>{
    const {title, category, capacity} = req.body;

    if(!title || title.trim() ==="") {
        return res.status(400).json({
            message: "title required!"
        });
    }

    if(!category || category.trim() === "") {
        return res.status(400).json({
            message: "category required!"
        });
    }

    if(capacity !== undefined && (typeof capacity !== "number" || capacity<=0)){
        return res.status(400).json({
            message: "capacity must be a positive number!"
        });
    }

    const newEvent = {
        id: events.length+1,
        title,
        category,
        capacity
    };

    events.push(newEvent);
    res.status(201).json(newEvent);
});

app.get("/api/events/:id", (req,res)=>{
    const id = Number(req.params.id);
    const event = events.find(
        (event)=>event.id === id
    );

    if(!event) {
        return res.status(400).json({
            message: "event not found"
        });
    }

    res.json(event);
});

app.listen(5000, ()=>{
    console.log("server running on port 5000");
});