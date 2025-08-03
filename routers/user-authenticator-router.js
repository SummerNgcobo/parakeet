const express = require("express");
const router = express.Router();
const userAuthenticatorController = require("../controllers/user-authenticator-controller.js");

router.get("/user", userAuthenticatorController.getUser);
router.get("/send-password-reset-email", userAuthenticatorController.sendPasswordResetEmail);
router.patch("/reset-password", userAuthenticatorController.resetPassword);
router.post("/user", userAuthenticatorController.getUser);
router.post("/send-password-reset-email", userAuthenticatorController.sendPasswordResetEmail);


module.exports = router;