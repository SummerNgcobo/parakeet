const express = require("express");
const router = express.Router();
const userAccountValidatorController = require("../controllers/user-account-verification-controller.js");

router.patch("/verify-account", userAccountValidatorController.verifyAccount);

module.exports = router;


