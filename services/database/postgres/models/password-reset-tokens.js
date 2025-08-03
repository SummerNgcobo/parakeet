const { sequelize } = require("../postgres-database.js");
const { DataTypes } = require("sequelize");
const AdminUsers = require("./admin-users.js");
const CareerCoachUsers = require("./career-coach-users.js");
const FacilitatorUsers = require("./facilitator-users.js");
const TalentUsers = require("./talent-users.js");
const TechnicalMentorUsers = require("./technical-mentor-users.js");

const PasswordResetTokens = sequelize.define("password_reset_tokens", {
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
    },
    userType: {
        type: DataTypes.ENUM(
            "admin",
            "facilitator",
            "technical mentor",
            "talent",
            "career coach"
        ),
        allowNull: false
    }
}, {
    freezeTableName: true
});

PasswordResetTokens.belongsTo(AdminUsers, {
    foreignKey: {
        field: "userId",
        type: DataTypes.INTEGER
    }
});

PasswordResetTokens.belongsTo(FacilitatorUsers, {
    foreignKey: {
        field: "userId",
        type: DataTypes.INTEGER
    }
});

PasswordResetTokens.belongsTo(TechnicalMentorUsers, {
    foreignKey: {
        field: "userId",
        type: DataTypes.INTEGER
    }
});

PasswordResetTokens.belongsTo(TalentUsers, {
    foreignKey: {
        field: "userId",
        type: DataTypes.INTEGER
    }
});

PasswordResetTokens.belongsTo(CareerCoachUsers, {
    foreignKey: {
        field: "userId",
        type: DataTypes.INTEGER
    }
});

module.exports = PasswordResetTokens;