const { userAccountValidatorModel, tableTypes } = require("../models/user-account-verification-model.js");
const jwt = require("../services/token/jwt/jwt.js");

const userAccountValidatorController = {
    async verifyAccount (req, res) {
        try {
            const validationTokenCookieName = "TMS-validation-token";
            let result;
            const tokenFromRequest = req.cookies[validationTokenCookieName];
            const { password, email, userType } = req.body;
            const userTable = tableTypes.user[userType];
            const userValidationTokenTable = tableTypes.validationToken[userType];
            const user = await userAccountValidatorModel.getUserByTokenAssociation(tokenFromRequest, userTable, userValidationTokenTable);

            if (!user) {
                throw new Error("User credentials are incorrect please ensure that details are properly set, before trying again");
            }
            const deconstructedTokenFromRequest = jwt.deconstructValidToken(tokenFromRequest);
            const deconstructedUserToken = jwt.deconstructValidToken(user.token);

            if (deconstructedTokenFromRequest.email != deconstructedUserToken.email) {
                throw new Error("Token was tempered with please contact administrator");
            }

            const updatedUserCredentials = await Promise.all([
                await userAccountValidatorModel.updateUserPasswordAndValidatedStatus(email, password, true, userTable),
                await userAccountValidatorModel.updateUserTokenValidatedStatus(user.userId, true, userValidationTokenTable)
            ]);
            result = updatedUserCredentials;

            if (result) {
                res.clearCookie(validationTokenCookieName, { httpOnly: true });
                res.status(200).json({
                    message: "Successfully updated user password"
                });
            }
        }
        catch (error) {
            console.error(error.message);
            res.status(400).json({
                error: {
                    message: "Authentication failed please contact administrator"
                }
            });
        }
    }
};

module.exports = userAccountValidatorController;



