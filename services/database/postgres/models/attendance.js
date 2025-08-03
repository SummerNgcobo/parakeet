const { sequelize } = require('../postgres-database.js');
const { DataTypes } = require('sequelize');
const User = require('./user');

const Attendance = sequelize.define('attendance_records', {
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
  clockIn: {
    type: DataTypes.DATE,
    allowNull: false
  },
  clockOut: {
    type: DataTypes.DATE,
    allowNull: true
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  duration: {
    type: DataTypes.VIRTUAL,
    get() {
      const inTime = this.getDataValue('clockIn');
      const outTime = this.getDataValue('clockOut');
      if (inTime && outTime) {
        return Math.floor((outTime - inTime) / 1000); // duration in seconds
      }
      return null;
    }
  }
}, {
  freezeTableName: true,
  timestamps: true
});

// Associations
Attendance.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Attendance, { foreignKey: 'userId', as: 'attendanceRecords' });

module.exports = Attendance;
