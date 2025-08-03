const { sequelize } = require("../postgres-database.js");
const { DataTypes } = require("sequelize");
const TalentUsers = require("./talent-users.js");

const TalentUsersValidationTokens = sequelize.define("talent_users_validation_tokens", {
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
TalentUsersValidationTokens.belongsTo(TalentUsers, {
    foreignKey: {
        field: "userId",
        type: DataTypes.INTEGER
    }
});

module.exports = TalentUsersValidationTokens;