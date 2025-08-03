const FacilitatorModel = require('../../models/user-models/facilitator-model.js');

const facilitatorController = {
    async addTrainee (req, res) {
        try {
            if (!req.body || !req.body.firstName || !req.body.lastName || !req.body.facilitatorId) {
                return res.status(400).json({
                    error: {
                        message: "firstName, lastName, and facilitatorId are required."
                    }
                });
            }

            const result = await FacilitatorModel.addTrainee(req.body);
            if (!result) {
                return res.status(400).json({
                    error: {
                        message: "Failed to add trainee"
                    }
                });
            }
            const message = result.message || "Trainee added successfully.";
            res.status(200).json({ message, trainee: result.trainee });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = facilitatorController;