require("dotenv").config();
const jwt = require("../services/token/jwt/jwt.js");

const tokenController = {
    async verifyUserToken (req, res) {
        try {
            const { userToken } = req.params;
            const deconstructedToken = jwt.deconstructValidToken(userToken);
            const isValidToken = deconstructedToken.iat ? true : false;

            if (isValidToken) {
                res.cookie("TMS-validation-token", userToken, { httpOnly: true ,secure: false });
                res.redirect(process.env.FRONTEND_USER_ACCOUNT_VALIDATOR_URL);
            }
            else {
                throw new Error("Invalid token");
            }
        }
        catch (error) {
            console.error(`There was an issue while validating user token: ${ error.message }`);
            res.status(400).json({
                error: {
                    message: "There seems to be an issue while validating your token, please contact your administrator"
                }
            });
        }
    },
    async resetUserPassword (req, res) {
        try {
            const { token } = req.params;
            const deconstructedToken = jwt.deconstructValidToken(token);
            const isValidToken = deconstructedToken.iat ? true : false;

            if (isValidToken) {
                res.cookie("TMS-reset-password-token", token, { httpOnly: true ,secure: false });
                res.redirect(process.env.FRONTEND_USER_PASSWORD_RESET_URL);
            }
            else {
                throw new Error("Invalid token");
            }
        }
        catch (error) {
            console.error(`There was an issue while validating password reset token: ${ error.message }`);
            res.status(400).json({
                error: {
                    message: "There seems to be an issue while validating your password reset token, please contact your administrator"
                }
            });
        }
    }
};

module.exports = tokenController;


