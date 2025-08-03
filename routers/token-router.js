const express = require("express");
const router = express.Router();
const tokenController = require("../controllers/token-controller.js");

router.get("/verify-user-token/:userToken", tokenController.verifyUserToken);
router.get("/reset-password/:token", tokenController.resetUserPassword);

module.exports = router;


