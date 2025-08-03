const { sequelize } = require('../postgres-database.js');
const { DataTypes } = require('sequelize');

const Event = sequelize.define('events', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['training', 'communication', 'networking']]
    }
  }
}, {
  freezeTableName: true,
  timestamps: true
});

module.exports = Event;