const { sequelize } = require("../postgres-database.js");
const { DataTypes } = require("sequelize");
const userModelHelper = require("./user-models/user-model-helper.js");

const TechnicalMentorUsers = sequelize.define("technical_mentor_users", {
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
        beforeCreate: async (technicalMentorUser, options) => {
            technicalMentorUser.password = userModelHelper.encryptPassword(technicalMentorUser.password);
        },
        beforeUpdate: async (technicalMentorUser, options) => {
            userModelHelper.updatePassword(technicalMentorUser);
        },
        beforeBulkCreate: async (technicalMentorUsers, options) => {
            for (const user of technicalMentorUsers) {
                user.password = userModelHelper.encryptPassword(user.password);
            }
        },
        beforeBulkUpdate: async (technicalMentorUsers) => {
            for (const user of technicalMentorUsers) {
                userModelHelper.updatePassword(user);
            }
        },

        // === ADDED HOOKS ===
        afterCreate: async (technicalMentorUser) => {
            await userModelHelper.syncUserToCentral(technicalMentorUser, 'technical_mentor_users', 'technical_mentor');
        },
        afterUpdate: async (technicalMentorUser) => {
            await userModelHelper.syncUserToCentral(technicalMentorUser, 'technical_mentor_users', 'technical_mentor');
        }
    }
});

module.exports = TechnicalMentorUsers;