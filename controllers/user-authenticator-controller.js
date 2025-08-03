const userAuthenticatorModel = require("../models/user-authenticator-model.js");

const userAuthenticatorController = {
    async getUser(req, res) {
        try {
            const isLoginRequest = req.method === "POST" && req.body && req.body.email && req.body.password && req.body.userType;

            // If it's a login attempt (POST /user), authenticate and overwrite session
            if (isLoginRequest) {
                const { password, email, userType } = req.body;
                const user = await userAuthenticatorModel.getUser(password, email, userType);

                // Save fresh user to session
                req.session.user = user;

                return res.status(200).json({
                    data: {
                        user,
                        token: req.cookies["TMS-validation-token"] || null
                    }
                });
            }

            // Otherwise, return session user if already authenticated
            if (req.session.user) {
                return res.status(200).json({
                    data: {
                        user: req.session.user,
                        token: req.cookies["TMS-validation-token"] || null
                    }
                });
            }

            // No session and no credentials provided
            return res.status(401).json({
                error: { message: "Not authenticated. Please log in." }
            });

        } catch (error) {
            console.error("Error in getUser:", error);
            res.status(400).json({
                error: { message: error.message }
            });
        }
    },

    async sendPasswordResetEmail(req, res) {
        try {
            const { email } = req.body;
            const user = await userAuthenticatorModel.getUserByEmail(email);

            if (!user || !user.validated) {
                return res.status(400).json({
                    error: { message: "User is either invalidated or does not exist" }
                });
            }

            const passwordSentMessage = await userAuthenticatorModel.sendPasswordResetEmail(email, user);

            if (!passwordSentMessage) {
                return res.status(400).json({
                    error: { message: "Failed to send password reset email" }
                });
            }

            res.status(200).json({
                message: passwordSentMessage.message
            });
        } catch (error) {
            console.error("Error sending password reset email:", error);
            res.status(500).json({
                error: { message: error.message }
            });
        }
    },

    async resetPassword(req, res) {
        try {
            const resetPasswordCookieToken = "TMS-reset-password-token";
            const token = req.cookies[resetPasswordCookieToken];
            const { password } = req.body;

            const resetResult = await userAuthenticatorModel.resetPassword(password, token);

            res.status(200).json({
                message: resetResult.message
            });
        } catch (error) {
            console.error("Error resetting password:", error);
            res.json({
                error: { message: error.message }
            });
        }
    }
};

module.exports = userAuthenticatorController;
