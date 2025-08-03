// models/eventAttendance.js
const { sequelize } = require('../postgres-database');
const { DataTypes } = require('sequelize');
const User = require('./user');
const Event = require('./event');

const EventAttendance = sequelize.define('event_attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  attending: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: true
});

// Relationships
EventAttendance.belongsTo(User, { foreignKey: 'userId', as: 'user' });
EventAttendance.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

User.hasMany(EventAttendance, { foreignKey: 'userId', as: 'attendances' });
Event.hasMany(EventAttendance, { foreignKey: 'eventId', as: 'attendances' });

module.exports = EventAttendance;
