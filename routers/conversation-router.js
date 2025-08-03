const express = require("express");
const router = express.Router();
const controller = require("../controllers/conversationController");

// Add this new route for finding conversations
router.get("/find/:userId1/:userId2", controller.getConversationBetweenUsers);

// Keep existing routes
router.get("/:userId", controller.getUserConversations);
router.post("/", controller.getOrCreateConversation);

module.exports = router;