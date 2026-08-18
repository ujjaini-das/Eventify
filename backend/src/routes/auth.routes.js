const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
router.get("/profile", protect, (req, res) => {
    res.json({
        message: "You are authenticated",
        user: req.user
    });
});

const { registerUser, loginUser } = require("../controllers/auth.controller");
router.post("/register", registerUser);
router.post("/login", loginUser);



module.exports = router;