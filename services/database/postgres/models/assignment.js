const { sequelize } = require('../postgres-database');
const { DataTypes } = require('sequelize');
const User = require('./user');

const Assignment = sequelize.define('assignments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  createdByEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'email',
    },
    onDelete: 'CASCADE',
  }
}, {
  freezeTableName: true,
  timestamps: true,
});

Assignment.belongsTo(User, { foreignKey: 'createdByEmail', as: 'creator' });
User.hasMany(Assignment, { foreignKey: 'createdByEmail', as: 'createdAssignments' });

module.exports = Assignment;
