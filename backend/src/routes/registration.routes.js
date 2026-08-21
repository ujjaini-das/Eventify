const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const{ registerForEvent } = require("../controllers/registration.controller");

router.post("/:id/register", protect, registerForEvent);

module.exports = router;