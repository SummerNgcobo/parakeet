const { sequelize } = require("../postgres-database.js");
const { DataTypes } = require("sequelize");
const userModelHelper = require("./user-models/user-model-helper.js");

const FacilitatorUsers = sequelize.define("facilitator_users", {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pass123"
    },
    validated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    freezeTableName: true,
    paranoid: true,
    hooks: {
        beforeCreate: async (facilitatorUser) => {
            facilitatorUser.password = userModelHelper.encryptPassword(facilitatorUser.password);
        },
        beforeUpdate: async (facilitatorUser) => {
            userModelHelper.updatePassword(facilitatorUser);
        },
        beforeBulkCreate: async (facilitatorUsers) => {
            for (const user of facilitatorUsers) {
                user.password = userModelHelper.encryptPassword(user.password);
            }
        },
        beforeBulkUpdate: async (facilitatorUsers) => {
            for (const user of facilitatorUsers) {
                userModelHelper.updatePassword(user);
            }
        },

        // === ADDED HOOKS ===
        afterCreate: async (facilitatorUser) => {
            await userModelHelper.syncUserToCentral(facilitatorUser, 'facilitator_users', 'facilitator');
        },
        afterUpdate: async (facilitatorUser) => {
            await userModelHelper.syncUserToCentral(facilitatorUser, 'facilitator_users', 'facilitator');
        }
    }
});

module.exports = FacilitatorUsers;