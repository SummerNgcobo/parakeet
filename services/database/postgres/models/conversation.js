const { DataTypes } = require("sequelize");
const { sequelize } = require("../postgres-database");

const Conversation = sequelize.define("conversations", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  participantOneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  participantTwoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  freezeTableName: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["participantOneId", "participantTwoId"]
    }
  ]
});


// Define associations in the model file
Conversation.associate = function(models) {
  Conversation.hasMany(models.Message, {
    foreignKey: 'conversationId',
    as: 'messages'
  });
};

module.exports = Conversation;