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
const jwt = require("../services/token/jwt/jwt.js");

const adminModel = {
    async importUsers (users) {
        try {
            let result = false;
            let usersByJobTitle = {
                admin: [],
                trainee: [],
                facilitator: [],
                careerCoach: [],
                technicalMentor: []
            };

            users.forEach((user) => {
                const { firstname, lastname, email, jobtitle } = user.properties;
                const userType = _userTypes[jobtitle];

                usersByJobTitle[userType].push({
                    firstName: firstname,
                    lastName: lastname,
                    email: email
                });
            });

            const databaseUserTables = tableTypes.user;
            const databaseUserValidationTokenTables = tableTypes.validationToken;

            const [
                savedAdminUsers,
                savedTraineeUsers,
                savedFacilitatorUsers,
                savedCareerCoachUsers,
                savedTechnicalMentorUsers
            ] = await Promise.all([
                await databaseUserTables.ADMIN.bulkCreate(usersByJobTitle.admin, { validate: true }),
                await databaseUserTables.TRAINEE.bulkCreate(usersByJobTitle.trainee, { validate: true }),
                await databaseUserTables.FACILITATOR.bulkCreate(usersByJobTitle.facilitator, { validate: true }),
                await databaseUserTables.CAREERCOACH.bulkCreate(usersByJobTitle.careerCoach, { validate: true }),
                await databaseUserTables.TECHNICALMENTOR.bulkCreate(usersByJobTitle.technicalMentor, { validate: true })
            ]);

            const [
                savedAdminTokens,
                savedTraineeTokens,
                savedFacilitatorTokens,
                savedCareerCoachTokens,
                savedTechnicalMentorTokens
            ] = await Promise.all([
                await _operations.createUserValidationTokens(databaseUserValidationTokenTables.ADMIN, savedAdminUsers),
                await _operations.createUserValidationTokens(databaseUserValidationTokenTables.TRAINEE, savedTraineeUsers),
                await _operations.createUserValidationTokens(databaseUserValidationTokenTables.FACILITATOR, savedFacilitatorUsers),
                await _operations.createUserValidationTokens(databaseUserValidationTokenTables.CAREERCOACH, savedCareerCoachUsers),
                await _operations.createUserValidationTokens(databaseUserValidationTokenTables.TECHNICALMENTOR, savedTechnicalMentorUsers)
            ]);

            if (savedTraineeTokens.length > 0 && savedFacilitatorTokens.length > 0, savedCareerCoachTokens.length > 0 && savedTechnicalMentorTokens.length > 0, savedAdminTokens.length > 0) {
                result = true;
            }

            return result
        }
        catch (error) {
            console.error("Error while importing users into database");
            throw new Error(error);
        }
    },
    async getUsersByTokenAssociation (userTable, tokenTable) {
        try {
            return await tokenTable.findAll({
                raw: true,
                include: [
                    {
                        model: userTable,
                        attributes: ["email"]
                    },
                ]
            });
        }
        catch (error) {
            console.error("There was an issue while fetching users by validation token");
            throw new Error(error);
        }
    }
};

const tableTypes = {
    user: {
        ADMIN: AdminUsers,
        TRAINEE: TalentUsers,
        FACILITATOR: FacilitatorUsers,
        CAREERCOACH: CareerCoachUsers,
        TECHNICALMENTOR: TechnicalMentorUsers
    },
    validationToken: {
        ADMIN: AdminUserValidationTokens,
        TRAINEE: TalentUsersValidationTokens,
        FACILITATOR: FacilitatorUserValidationTokens,
        CAREERCOACH: CareerCoachUserValidationTokens,
        TECHNICALMENTOR: TechnicalMentorUserValidationTokens
    }
};

const tableColumns = {
    email: {
        admin: "admin_user.email",
        trainee: "talent_user.email",
        facilitator: "facilitator_user.email",
        careerCoach: "career_coach_user.email",
        technicalMentor: "technical_mentor_user.email"
    }
};

const _userTypes = {
    "admin": "admin",
    "trainee": "trainee",
    "facilitator": "facilitator",
    "career coach": "careerCoach",
    "technical mentor": "technicalMentor"
};

const _operations = {
    async createUserValidationTokens (userTokenType, users) {
        try {
            return await Promise.all(users.map(async (user) => {
                const tokenOptions = {
                    email: user.email
                };
                const generatedToken = jwt.createToken(tokenOptions);
                return await userTokenType.create({
                    token: generatedToken,
                    userId: user.id
                });
            }));
        }
        catch (error) {
            console.error("There was an issue while creating validation tokens");
            throw new Error(error);
        }
    }
}

module.exports = { adminModel, tableTypes, tableColumns };