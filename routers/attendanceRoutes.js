const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// User endpoints
router.post('/clock-in', attendanceController.clockIn);
router.post('/clock-out', attendanceController.clockOut);

// Use email param instead of userId param here
router.get('/user/:email', attendanceController.getUserAttendance);

// Admin endpoints
router.get('/', attendanceController.getAllAttendance);

module.exports = router;
