const TalentUsers = require("../services/database/postgres/models/talent-users.js");
const TalentUserModel = require("./user-models/talent-user-model.js");
const FacilitatorUsers = require("../services/database/postgres/models/facilitator-users.js");
const FacilitatorModel = require("./user-models/facilitator-model.js");
const CareerCoachUsers = require("../services/database/postgres/models/career-coach-users.js");
const CareerCoachModel = require("./user-models/career-coach-model.js");
const TechnicalMentorUsers = require("../services/database/postgres/models/technical-mentor-users.js");
const TechnicalMentorModel = require("./user-models/technical-mentor-model.js");
const AdminUsers = require("../services/database/postgres/models/admin-users.js");
const PasswordResetTokens = require("../services/database/postgres/models/password-reset-tokens.js");
const bcrypt = require("bcrypt");
const jwt = require("../services/token/jwt/jwt.js");
const { mailer, mailerTypes } = require("../services/mailer/mailer.js");

const userAuthenticatorModel = {
    async getUser (password, email, userType) {
        if (!_userTableTypes[userType]) {
            throw new Error(_errorMessages.invalidCredentials);
        }

        const userModel = _userModelTypes[userType];
        let user;
        if (userModel) {
            user = await userModel.getUser(email);
        }
        else {
            const userTable = _userTableTypes[userType];
            user = await userTable.findOne({
                raw: true,
                where: {
                    email: email
                }
            });
        }

        if (!user || !user.validated) {
            throw new Error(_errorMessages.invalidatedUser);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw new Error(_errorMessages.invalidCredentials);
        }

        delete user.password;
        return user;
    },
    async getUserByEmail (email) {
        // This has to be dynamic based on userType
        const userTypes = Object.keys(_userTableTypes);
        let user;

        for (const userType of userTypes) {
            user = await _userTableTypes[userType].findOne({
                where: {
                    email: email
                }
            });

            if (user) {
                user.type = userType; // Add user type to the user object
                break;
            }
        }

        if (!user) {
            throw new Error(_errorMessages.invalidatedUser);
        }

        return user;
    },
    async sendPasswordResetEmail (email, user) {
        if (!user) {
            user = await this.getUserByEmail(email);
            if (!user) {
                throw new Error(_errorMessages.invalidatedUser);
            }
        }

        const token = jwt.createToken({ email: user.email });

        await PasswordResetTokens.create({
            email: user.email,
            token: token,
            userType: user.type
        });

        const mailDetails = {
            recipients: [{
                email: user.email,
                validationToken: token
            }]
        };

        await mailer.sendMail(mailDetails, mailerTypes.RESETPASSWORD);

        return {
            message: "Password reset email sent successfully"
        };
    },
    async resetPassword (password, token) {
        if (!token) {
            throw new Error("Token is required for password reset");
        }

        const deconstructedToken = jwt.deconstructValidToken(token);

        const passwordResetToken = await PasswordResetTokens.findOne({
            where: {
                "token": token,
                used: false
            }
        });
        if (!passwordResetToken) {
            throw new Error("Invalid or already used password reset token");
        }

        const user = await this.getUserByEmail(deconstructedToken.email);
        if (!user) {
            throw new Error(_errorMessages.invalidatedUser);
        }

        // Update the user's password
        user.set({
            password: password
        });

        // Mark the token as used
        passwordResetToken.set({
            used: true
        });

        await Promise.all([
            user.save(),
            PasswordResetTokens.destroy({ where: { "token": token } })
        ]);

        return {
            message: "Password reset successfully"
        };
    }
};

const _userTableTypes = {
    "admin": AdminUsers,
    "trainee": TalentUsers,
    "facilitator": FacilitatorUsers,
    "career coach": CareerCoachUsers,
    "technical mentor": TechnicalMentorUsers
};
const _userModelTypes = {
    "technical mentor": TechnicalMentorModel,
    "career coach": CareerCoachModel,
    "facilitator": FacilitatorModel,
    "trainee": TalentUserModel
};

const _errorMessages = {
    invalidCredentials: "Invalid credentials, please verify that all entered details are correct",
    invalidatedUser: "User is either invalidated or does not exists"
};

module.exports = userAuthenticatorModel;