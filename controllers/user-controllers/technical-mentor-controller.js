const TechnicalMentorModel = require('../../models/user-models/technical-mentor-model.js');

const TechnicalMentorController = {
    async addMentee (req, res) {
        try {
            if (!req.body || !req.body.firstName || !req.body.lastName || !req.body.mentorId) {
                return res.status(400).json({
                    error: {
                        message: "firstName, lastName, and mentorId are required."
                    }
                });
            }

            const result = await TechnicalMentorModel.addMentee(req.body);
            if (!result) {
                return res.status(400).json({
                    error: {
                        message: "Failed to add mentee"
                    }
                });
            }
            const message = result.message || "Mentee added successfully.";
            res.status(200).json({ message, trainee: result.trainee });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = TechnicalMentorController;