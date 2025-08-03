const TraineeReview = require('../services/database/postgres/models/TraineeReview');

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await TraineeReview.findAll();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const review = await TraineeReview.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await TraineeReview.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
