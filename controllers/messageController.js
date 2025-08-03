const Messages = require("../services/database/postgres/models/messageModel.js");

exports.getMessages = async (req, res) => {
  const { conversationId, limit = 20, offset = 0 } = req.query;

  try {
    const messages = await Messages.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    res.status(500).json({ error: "Error fetching messages" });
  }
};

exports.sendMessage = async (req, res) => {
  const { conversationId, senderId, recipientId, message, image } = req.body;

  try {
    const newMessage = await Messages.create({
      conversationId,
      senderId,
      recipientId,
      message,
      image,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Failed to send message:", error);
    res.status(500).json({ error: "Error sending message" });
  }
};

exports.editMessage = async (req, res) => {
  const { messageId } = req.params;
  const { message } = req.body;

  try {
    const msg = await Messages.findByPk(messageId);

    if (!msg) return res.status(404).json({ error: "Message not found" });

    msg.message = message;
    await msg.save();

    res.json(msg);
  } catch (error) {
    console.error("Failed to edit message:", error);
    res.status(500).json({ error: "Error editing message" });
  }
};
exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const msg = await Messages.findByPk(messageId);

    if (!msg) return res.status(404).json({ error: "Message not found" });

    await msg.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete message:", error);
    res.status(500).json({ error: "Error deleting message" });
  }
};
exports.getConversationMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await Messages.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);
  } catch (error) {
    console.error("Failed to fetch conversation messages:", error);
    res.status(500).json({ error: "Error fetching conversation messages" });
  }
};
exports.getRecentMessages = async (req, res) => {
  const { limit = 10 } = req.query;

  try {
    const messages = await Messages.findAll({
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
    });

    res.json(messages);
  } catch (error) {
    console.error("Failed to fetch recent messages:", error);
    res.status(500).json({ error: "Error fetching recent messages" });
  }
};


exports.getLastMessageForConversation = async (req, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    return res.status(400).json({ error: "Missing conversationId parameter" });
  }

  try {
    const lastMessage = await Messages.findOne({
      where: { conversationId },
      order: [["createdAt", "DESC"]],
    });

    if (!lastMessage) {
      return res.status(404).json({ error: "No messages found for this conversation" });
    }

    res.json(lastMessage);
  } catch (error) {
    console.error("Failed to fetch last message:", error);
    res.status(500).json({ error: "Error fetching last message" });
  }
};


exports.getUserMessages = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Messages.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { recipientId: userId }],
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(messages);
  } catch (error) {
    console.error("Failed to fetch user messages:", error);
    res.status(500).json({ error: "Error fetching user messages" });
  }
};

exports.addReaction = async (req, res) => {
  const { messageId, emoji, userId } = req.body;
  
  try {
    const message = await Messages.findByPk(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const reactions = message.reactions || {};
    reactions[userId] = emoji; // Store who reacted with what
    
    await message.update({ reactions });
    res.json(message);

    // Broadcast reaction
    io.to(`conversation_${message.conversationId}`)
      .emit("newReaction", { messageId, reactions });
  } catch (error) {
    console.error("Reaction error:", error);
    res.status(500).json({ error: "Failed to add reaction" });
  }
};