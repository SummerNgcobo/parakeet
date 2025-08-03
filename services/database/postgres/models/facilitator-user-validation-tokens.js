const { sequelize } = require("../postgres-database.js");
const { DataTypes } = require("sequelize");
const FacilitatorUsers = require("./facilitator-users.js");

const FacilitatorUsersValidationTokens = sequelize.define("facilitator_user_validation_tokens", {
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
FacilitatorUsersValidationTokens.belongsTo(FacilitatorUsers, {
    foreignKey: {
        field: "userId",
        type: DataTypes.INTEGER
    }
});

module.exports = FacilitatorUsersValidationTokens;