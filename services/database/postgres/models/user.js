const { DataTypes } = require('sequelize');
const { sequelize } = require('../postgres-database.js');


const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM(
      'admin',
      'trainee',
      'facilitator',
      'technical_mentor',
      'career_coach',
      'talent' 
    ),
    allowNull: false
  },
  sourceTable: { type: DataTypes.STRING, allowNull: false },
  sourceUserId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  freezeTableName: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['sourceTable', 'sourceUserId']
    }
  ]
});

module.exports = User;