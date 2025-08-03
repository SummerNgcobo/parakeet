const express = require('express');
const router = express.Router();
const controller = require('../controllers/traineeReviewController');

router.get('/', controller.getAllReviews);
router.post('/', controller.createReview);
router.get('/:id', controller.getReviewById);

module.exports = router;
