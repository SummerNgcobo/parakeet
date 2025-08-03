const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// User endpoints (now using email)
router.post('/', leaveController.createLeaveRequest); // Body must include `email` instead of `userId`
router.get('/user/:email', leaveController.getUserLeaveRequests); // Get leave requests by user email
router.put('/:id', leaveController.updateLeaveRequest); // Body must include `email`

// Admin endpoints
router.get('/', leaveController.getAllLeaveRequests);
router.put('/:id/process', leaveController.processLeaveRequest); // Process leave request by ID

module.exports = router;
