const { sequelize } = require("../postgres-database.js");
const { DataTypes } = require("sequelize");
const userModelHelper = require("./user-models/user-model-helper.js");

const CareerCoachUsers = sequelize.define("career_coach_users", {
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
        beforeCreate: async (careerCoachUser, options) => {
            careerCoachUser.password = userModelHelper.encryptPassword(careerCoachUser.password);
        },
        beforeUpdate: async (careerCoachUser, options) => {
            userModelHelper.updatePassword(careerCoachUser);
        },
        beforeBulkCreate: async (careerCoachUsers, options) => {
            for (const user of careerCoachUsers) {
                user.password = userModelHelper.encryptPassword(user.password);
            }
        },
        beforeBulkUpdate: async (careerCoachUsers) => {
            for (const user of careerCoachUsers) {
                userModelHelper.updatePassword(user);
            }
        },

        // === ADDED HOOKS ===
        afterCreate: async (careerCoachUser, options) => {
            await userModelHelper.syncUserToCentral(careerCoachUser, 'career_coach_users', 'career_coach');
        },
        afterUpdate: async (careerCoachUser, options) => {
            await userModelHelper.syncUserToCentral(careerCoachUser, 'career_coach_users', 'career_coach');
        }
    }
});

module.exports = CareerCoachUsers;