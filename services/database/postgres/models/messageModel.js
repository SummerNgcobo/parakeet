const { DataTypes } = require("sequelize");
const { sequelize } = require("../postgres-database");

const Message = sequelize.define("messages", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'conversations',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      notEmpty: true
    }
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reactions: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  freezeTableName: true,
  timestamps: true,
});

// Define associations in the model file
Message.associate = function(models) {
  Message.belongsTo(models.Conversation, {
    foreignKey: 'conversationId',
    as: 'conversation'
  });
};

module.exports = Message;