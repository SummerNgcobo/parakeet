const { Op } = require("sequelize");
const Conversation = require("../services/database/postgres/models/conversation");

exports.getUserConversations = async (req, res) => {
  const { userId } = req.params;

  try {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { participantOneId: userId },
          { participantTwoId: userId }
        ]
      },
      order: [["updatedAt", "DESC"]]
    });

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

exports.getConversationBetweenUsers = async (req, res) => {
  let { userId1, userId2 } = req.params;

  // Normalize order to match getOrCreateConversation logic
  userId1 = parseInt(userId1);
  userId2 = parseInt(userId2);
  const userOne = Math.min(userId1, userId2);
  const userTwo = Math.max(userId1, userId2);

  try {
    const conversation = await Conversation.findOne({
      where: {
        participantOneId: userOne,
        participantTwoId: userTwo
      }
    });

    if (!conversation) {
      return res.status(404).json({ 
        message: "Conversation not found",
        shouldCreate: true 
      });
    }

    res.json(conversation);
  } catch (error) {
    console.error("Error finding conversation:", error);
    res.status(500).json({ error: "Failed to find conversation" });
  }
};


exports.getOrCreateConversation = async (req, res) => {
  let { userId1, userId2 } = req.body;

  if (!userId1 || !userId2) {
    return res.status(400).json({ 
      error: "Both user IDs are required" 
    });
  }

  // Ensure consistent ordering
  const userOne = Math.min(userId1, userId2);
  const userTwo = Math.max(userId1, userId2);

  try {
    const [conversation] = await Conversation.findOrCreate({
      where: {
        participantOneId: userOne,
        participantTwoId: userTwo
      },
      defaults: {
        participantOneId: userOne,
        participantTwoId: userTwo
      }
    });

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error getting/creating conversation:", error);
    res.status(500).json({ error: "Failed to get/create conversation" });
  }
};