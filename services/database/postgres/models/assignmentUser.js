const { sequelize } = require('../postgres-database');
const { DataTypes } = require('sequelize');
const User = require('./user');
const Assignment = require('./assignment');

const AssignmentUser = sequelize.define('assignment_user', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'email',
    },
    onDelete: 'CASCADE',
  },
  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assignments',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  submitted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  submissionLink: DataTypes.STRING,
  submissionComment: DataTypes.TEXT,
  submittedAt: DataTypes.DATE,
  grade: DataTypes.INTEGER,
  comments: DataTypes.TEXT,
  gradedAt: DataTypes.DATE,
}, {
  freezeTableName: true,
  timestamps: true,

  // ✅ Composite Unique Constraint
  indexes: [
    {
      unique: true,
      fields: ['userEmail', 'assignmentId'],
      name: 'unique_user_assignment'
    }
  ]
});

// Set many-to-many
Assignment.belongsToMany(User, {
  through: AssignmentUser,
  foreignKey: 'assignmentId',
  otherKey: 'userEmail',
  sourceKey: 'id',
  targetKey: 'email'  
});

User.belongsToMany(Assignment, {
  through: AssignmentUser,
  foreignKey: 'userEmail',
  otherKey: 'assignmentId',
  sourceKey: 'email', 
  targetKey: 'id'
});

// For include queries
AssignmentUser.belongsTo(Assignment, { foreignKey: 'assignmentId' });
AssignmentUser.belongsTo(User, { 
  foreignKey: 'userEmail',
  targetKey: 'email' 
});

module.exports = AssignmentUser;
