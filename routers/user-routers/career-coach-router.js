const express = require('express');
const careerCoachController = require('../../controllers/user-controllers/career-coach-controller.js');

const router = express.Router();

router.patch('/add-coachee', careerCoachController.addCoachee);

module.exports = router;
