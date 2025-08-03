const TalentUsers = require("../services/database/postgres/models/talent-users.js");
const TalentUsersValidationTokens = require("../services/database/postgres/models/talent-users-validation-tokens.js");
const FacilitatorUsers = require("../services/database/postgres/models/facilitator-users.js");
const FacilitatorUserValidationTokens = require("../services/database/postgres/models/facilitator-user-validation-tokens.js");
const CareerCoachUsers = require("../services/database/postgres/models/career-coach-users.js");
const CareerCoachUserValidationTokens = require("../services/database/postgres/models/career-coach-user-validation-tokens.js");
const TechnicalMentorUsers = require("../services/database/postgres/models/technical-mentor-users.js");
const TechnicalMentorUserValidationTokens = require("../services/database/postgres/models/technical-mentor-user-validation-tokens.js");
const AdminUsers = require("../services/database/postgres/models/admin-users.js");
const AdminUserValidationTokens = require("../services/database/postgres/models/admin-user-validation-tokens.js");

const userAccountValidatorModel = {
    async getUserByTokenAssociation (token, userTable, tokenTable) {
        try {
            const user = await tokenTable.findOne({
                raw: true,
                where: {
                    token: token
                },
                include: [{
                    model: userTable
                }]
            });
            return user;
        }
        catch (error) {
            console.error("There was an issue while retrieving user by associated token");
            throw new Error(error);
        }
    },
    async updateUserPasswordAndValidatedStatus (email, password, status, userTable) {
        try {
            const user = await userTable.findOne({
                where: {
                    email: email
                }
            });

            if (user.validated) {
                throw new Error(`This user (${ user.email }) is already validated!`);
            }
            user.set({
                password: password,
                validated: status
            });
            const updatedUser = await user.save();

            return updatedUser;
        }
        catch (error) {
            console.error("There was an issue while updating user password and validated status");
            throw new Error(error);
        }
    },
    async updateUserTokenValidatedStatus (userId, status, validationTokenTable) {
        try {
            const token = await validationTokenTable.findOne({
                where: {
                    userId: userId
                }
            });

            if (token.used) {
                throw new Error(`This token (tokenId: ${ token.id }) has already been used!`);
            }
            token.set({ used: status });
            const updatedTokenStatus = await token.save();

            return updatedTokenStatus;
        }
        catch (error) {
            console.error("There was an issue while updating user token used status");
            throw new Error(error);
        }
    }
};

const tableTypes = {
    user: {
        "admin": AdminUsers,
        "trainee": TalentUsers,
        "facilitator": FacilitatorUsers,
        "career coach": CareerCoachUsers,
        "technical mentor": TechnicalMentorUsers
    },
    validationToken: {
        "admin": AdminUserValidationTokens,
        "trainee": TalentUsersValidationTokens,
        "facilitator": FacilitatorUserValidationTokens,
        "career coach": CareerCoachUserValidationTokens,
        "technical mentor": TechnicalMentorUserValidationTokens
    }
};

module.exports = { userAccountValidatorModel, tableTypes };