const express = require("express");
const adminController = require("../controllers/admin-controller.js");
const router = express.Router();

router.get("/send-user-invites", adminController.sendUserInvites);

router.post("/onboard", adminController.onboard);

module.exports = router;