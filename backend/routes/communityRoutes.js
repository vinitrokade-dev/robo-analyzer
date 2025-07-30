const express = require("express");
const { getMessages, postMessage } = require("../controllers/communityController");
const auth = require("../middleware/auth");
const router = express.Router();

// Public route to get messages
router.get("/", getMessages);

// Protected route to post messages (requires authentication)
router.post("/", auth, postMessage);

module.exports = router;
