const express = require("express");
const router = express.Router();
const {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  getConversationMessages,
  getRecentMessages,
  getUserMessages,
  getLastMessageForConversation,
} = require("../controllers/messageController");

// GET /messages?conversationId=1&limit=20&offset=0
router.get("/", getMessages);

// POST /messages
router.post("/", sendMessage);

// DELETE /messages/:messageId
router.delete("/:messageId", deleteMessage);

// PUT /messages/:messageId
router.put("/:messageId", editMessage);

// GET /conversations/:conversationId/messages
router.get("/conversations/:conversationId/messages", getConversationMessages);

// GET /messages/recent?limit=10
router.get("/recent", getRecentMessages);

// GET /users/:userId/messages
router.get("/users/:userId/messages", getUserMessages);

// GET /conversations/:conversationId/lastMessage
router.get("/conversations/:conversationId/lastMessage", getLastMessageForConversation);


module.exports = router;