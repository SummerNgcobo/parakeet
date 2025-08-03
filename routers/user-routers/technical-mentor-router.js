const express = require('express');
const technicalMentorController = require('../../controllers/user-controllers/technical-mentor-controller.js');

const router = express.Router();

router.patch('/add-mentee', technicalMentorController.addMentee);

module.exports = router;
