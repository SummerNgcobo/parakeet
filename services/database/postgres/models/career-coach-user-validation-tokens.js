const { sequelize } = require("../postgres-database.js");
const { DataTypes } = require("sequelize");
const CareerCoachUsers = require("./career-coach-users.js");

const CareerCoachUserValidationTokens = sequelize.define("career_coach_user_validation_tokens", {
    token: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    userId: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true
});

// This ensures that association exists in case it gets removed during the process of migrations
CareerCoachUserValidationTokens.belongsTo(CareerCoachUsers, {
    foreignKey: {
        field: "userId",
        type: DataTypes.INTEGER
    }
});

module.exports = CareerCoachUserValidationTokens;