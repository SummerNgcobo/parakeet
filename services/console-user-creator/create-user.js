const AdminUsers = require("../database/postgres/models/admin-users.js");
const AdminUserValidationTokens = require("../database/postgres/models/admin-user-validation-tokens.js");
const TalentUsers = require("../database/postgres/models/talent-users.js");
const TalentUsersValidationTokens = require("../database/postgres/models/talent-users-validation-tokens.js");
const CareerCoachUsers = require("../database/postgres/models/career-coach-users.js");
const CareerCoachUserValidationTokens = require("../database/postgres/models/career-coach-user-validation-tokens.js");
const TechnicalMentorUsers = require("../database/postgres/models/technical-mentor-users.js");
const TechnicalMentorUserValidationTokens = require("../database/postgres/models/technical-mentor-user-validation-tokens.js");
const FacilitatorUsers = require("../database/postgres/models/facilitator-users.js");
const FacilitatorUsersValidationTokens = require("../database/postgres/models/facilitator-user-validation-tokens.js");

const jwt = require("../token/jwt/jwt.js");
const { mailer, mailerTypes } = require("../mailer/mailer.js");
const prompt = require('prompt-sync')({sigint: true});

const userOptions = {
    "1": "admin",
    "2": "trainee",
    "3": "careerCoach",
    "4": "technicalMentor",
    "5": "facilitator"
};

const tableTypes = {
    user: {
        "admin": AdminUsers,
        "trainee": TalentUsers,
        "careerCoach": CareerCoachUsers,
        "technicalMentor": TechnicalMentorUsers,
        "facilitator": FacilitatorUsers
    },
    validationToken: {
        "admin": AdminUserValidationTokens,
        "trainee": TalentUsersValidationTokens,
        "careerCoach": CareerCoachUserValidationTokens,
        "technicalMentor": TechnicalMentorUserValidationTokens,
        "facilitator": FacilitatorUsersValidationTokens
    }
};

console.log("Please provide the 'number' of the user type that is to be created");
const userOptionsKeys = Object.keys(userOptions);
userOptionsKeys.forEach((key) => {
    console.log(`${ key }. ${ userOptions[key] }`);
});
const enteredNumber = prompt("Enter number: ");
const userOption = userOptions[enteredNumber];
const selectedUserType = tableTypes.user[userOption];
const selectedUserTypeValidationTokenTable = tableTypes.validationToken[userOption];
const enteredFirstName = prompt("Enter user first name: ");
const enteredLastName = prompt("Enter user last name: ");
const enteredEmail = prompt("Enter user email: ");

(async () => {
    try {
        const user = await selectedUserType.create({
            firstName: enteredFirstName,
            lastName: enteredLastName,
            email: enteredEmail
        });
        console.log("Successfully created user");

        const token = jwt.createToken({ email: user.email });

        const userToken = await selectedUserTypeValidationTokenTable.create({
            token: token,
            userId: user.id
        });

        console.log("Successfully created user token");

        const mailDetails = {
            recipients: [
                {
                    email: user.email,
                    validationToken: userToken.token
                }
            ]
        };

        console.log("Sending email...")
        await mailer.sendMail(mailDetails, mailerTypes.INVITE);
        console.log("Please check mail inbox for invite");
    } catch (error) {
        throw new Error(error);
    }
})();