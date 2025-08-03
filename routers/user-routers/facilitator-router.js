const express = require('express');
const facilitatorController = require('../../controllers/user-controllers/facilitator-controller.js');

const router = express.Router();

router.patch('/add-trainee', facilitatorController.addTrainee);

module.exports = router;
