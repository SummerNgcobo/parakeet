// models/Avatar.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../postgres-database.js');
const User = require('./user');

const Avatar = sequelize.define('avatars', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  image: {
    type: DataTypes.BLOB('long'), // stores binary image data
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // one avatar per user
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  freezeTableName: true,
  timestamps: true
});

// Associate avatar with user
User.hasOne(Avatar, { foreignKey: 'userId', as: 'avatar' });
Avatar.belongsTo(User, { foreignKey: 'userId' });

module.exports = Avatar;
