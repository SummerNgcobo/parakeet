const { sequelize } = require("../postgres-database.js");
const { DataTypes } = require("sequelize");
const userModelHelper = require("./user-models/user-model-helper.js");

const AdminUsers = sequelize.define("admin_users", {
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
        beforeCreate: async (adminUser, options) => {
            adminUser.password = userModelHelper.encryptPassword(adminUser.password);
        },
        beforeUpdate: async (adminUser, options) => {
            userModelHelper.updatePassword(adminUser);
        },
        beforeBulkCreate: async (adminUsers, options) => {
            for (const user of adminUsers) {
                user.password = userModelHelper.encryptPassword(user.password);
            }
        },
        beforeBulkUpdate: async (adminUsers) => {
            for (const user of adminUsers) {
                userModelHelper.updatePassword(user);
            }
        },

        // === ADDED HOOKS ===
        afterCreate: async (adminUser, options) => {
            await userModelHelper.syncUserToCentral(adminUser, 'admin_users', 'admin');
        },
        afterUpdate: async (adminUser, options) => {
            await userModelHelper.syncUserToCentral(adminUser, 'admin_users', 'admin');
        }
    }
});

module.exports = AdminUsers;