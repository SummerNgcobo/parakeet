const { DataTypes } = require('sequelize');
const { sequelize } = require('../postgres-database');

const TraineeReview = sequelize.define('trainee_reviews', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  traineeName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  jobReadiness: {
    type: DataTypes.ENUM('Ready', 'Almost Ready', 'Needs Work'),
    allowNull: false
  },
  wellBeing: {
    type: DataTypes.ENUM('Excellent', 'Good', 'Fair', 'Poor'),
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastSession: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  freezeTableName: true,
  timestamps: true
});

module.exports = TraineeReview;
