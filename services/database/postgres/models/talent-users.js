const { sequelize } = require("../postgres-database.js");
const { DataTypes } = require("sequelize");
const userModelHelper = require("./user-models/user-model-helper.js");
const CareerCoachUsers = require("./career-coach-users.js");
const TechnicalMentorUsers = require("./technical-mentor-users.js");
const FacilitatorUsers = require("./facilitator-users.js");

const TalentUsers = sequelize.define("talent_users", {
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
    cohort: {
        type: DataTypes.STRING,
        allowNull: true
    },
    specialisation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    validated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    technicalMentorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "technical_mentor_users",
            key: 'id'
        }
    },
    facilitatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "facilitator_users",
            key: 'id'
        }
    },
    careerCoachId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "career_coach_users",
            key: 'id'
        }
    }
}, {
    freezeTableName: true,
    paranoid: true,
    hooks: {
        beforeCreate: async (talentUser, options) => {
            talentUser.password = userModelHelper.encryptPassword(talentUser.password);
        },
        beforeUpdate: async (talentUser, options) => {
            userModelHelper.updatePassword(talentUser);
        },
        beforeBulkCreate: async (talentUsers, options) => {
            for (const user of talentUsers) {
                user.password = userModelHelper.encryptPassword(user.password);
            }
        },
        beforeBulkUpdate: async (talentUsers) => {
            for (const user of talentUsers) {
                userModelHelper.updatePassword(user);
            }
        },

        // === ADDED HOOKS ===
        afterCreate: async (talentUser) => {
            await userModelHelper.syncUserToCentral(talentUser, 'talent_users', 'talent');
        },
        afterUpdate: async (talentUser) => {
            await userModelHelper.syncUserToCentral(talentUser, 'talent_users', 'talent');
        }
    }
});

/**
 * Table associations
 * - ensure that table model definitions include fields with table model reference e.g:
 *      technicalMentorId should have reference to technical_mentor_users model
 * */
TechnicalMentorUsers.hasMany(TalentUsers, { foreignKey: 'technicalMentorId' });
FacilitatorUsers.hasMany(TalentUsers, { foreignKey: 'facilitatorId' });
CareerCoachUsers.hasMany(TalentUsers, { foreignKey: 'careerCoachId' });

TalentUsers.belongsTo(TechnicalMentorUsers, { foreignKey: 'technicalMentorId' });
TalentUsers.belongsTo(FacilitatorUsers, { foreignKey: 'facilitatorId' });
TalentUsers.belongsTo(CareerCoachUsers, { foreignKey: 'careerCoachId' });

module.exports = TalentUsers;