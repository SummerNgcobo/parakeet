const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Public routes
router.get('/', eventController.getAllEvents);

// User routes
router.post('/:eventId/attendance', eventController.updateAttendance);
router.get('/user/:email', eventController.getUserEvents);

// Admin routes
router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.get('/:id', eventController.getEventById);

// Admin routes
router.post('/', eventController.createEvent);

module.exports = router;