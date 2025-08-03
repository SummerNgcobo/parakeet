const CareerCoachModel = require('../../models/user-models/career-coach-model.js');

const careerCoachController = {
    async addCoachee (req, res) {
        try {
            if (!req.body || !req.body.firstName || !req.body.lastName || !req.body.coachId) {
                return res.status(400).json({
                    error: {
                        message: "firstName, lastName, and coachId are required."
                    }
                });
            }

            const result = await CareerCoachModel.addCoachee(req.body);
            if (!result) {
                return res.status(400).json({
                    error: {
                        message: "Failed to add coachee"
                    }
                });
            }
            const message = result.message || "Coachee added successfully.";
            res.status(200).json({ message, trainee: result.trainee });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = careerCoachController;