const { DataTypes } = require('sequelize');
const { sequelize } = require('../postgres-database.js');
const User = require('./user');

const LeaveRequest = sequelize.define('leave_requests', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE' 
  },
  leaveType: {
    type: DataTypes.ENUM('Sick', 'Personal', 'Ad Hoc', 'Family'),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending'
  },
  adminComment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  freezeTableName: true,
  timestamps: true
});

LeaveRequest.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(LeaveRequest, { foreignKey: 'userId' });

module.exports = LeaveRequest;
